import { buildWeeklyContentPrompt } from "./prompt-builder";
import { prisma } from "./prisma";

interface GenerateOptions {
    planId: string;
}

function getPostingDays(
    year: number,
    month: number,
    scheduleType: "MWF" | "TU_TH_SA"
): Date[] {
    const days: Date[] = [];
    const targetDays =
        scheduleType === "MWF" ? [1, 3, 5] : [2, 4, 6];

    const daysInMonth = new Date(year, month, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month - 1, d);
        if (targetDays.includes(date.getDay())) {
            days.push(date);
        }
    }
    return days;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

interface AIPost {
    dayIndex: number;
    postType: "FEED" | "STORY" | "REEL" | "AD";
    platform: string;
    captionAr: string;
    captionEn: string;
    hashtags: string;
    cta: string;
    adHeadline?: string;
    adBody?: string;
    hookScript?: string;
}

async function callAI(prompt: string): Promise<string> {
    const provider = process.env.AI_PROVIDER || "openai";

    if (provider === "gemini") {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

        const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `You are an expert social media strategist for businesses in the Middle East. You create engaging, culturally relevant content in Arabic and English. Always return valid JSON.\n\n${prompt}`,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.8,
                    responseMimeType: "application/json",
                },
            }),
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Gemini API error ${res.status}: ${errText}`);
        }

        const data = await res.json();
        const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        return text;
    }

    // OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

    const model = process.env.OPENAI_MODEL || "gpt-4o";
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                {
                    role: "system",
                    content:
                        "You are an expert social media strategist for businesses in the Middle East. You create engaging, culturally relevant content in Arabic and English. Always return valid JSON.",
                },
                { role: "user", content: prompt },
            ],
            temperature: 0.8,
            response_format: { type: "json_object" },
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenAI API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || "{}";
}

export async function generateContentPlan(
    options: GenerateOptions
): Promise<{ success: boolean; postsCreated: number; error?: string }> {
    const plan = await prisma.contentPlan.findUnique({
        where: { id: options.planId },
        include: {
            profile: {
                include: { client: true },
            },
        },
    });

    if (!plan) {
        return { success: false, postsCreated: 0, error: "Plan not found" };
    }

    const profile = plan.profile;
    const client = profile.client;

    const postingDays = getPostingDays(
        plan.year,
        plan.month,
        plan.scheduleType
    );

    if (postingDays.length === 0) {
        return {
            success: false,
            postsCreated: 0,
            error: "No posting days found for this month/schedule",
        };
    }

    const weeks = chunkArray(postingDays, 3);
    const totalWeeks = weeks.length;

    // Delete existing posts for this plan (regeneration)
    await prisma.contentPost.deleteMany({
        where: { planId: plan.id },
    });

    const allPosts: {
        date: Date;
        postType: "FEED" | "STORY" | "REEL" | "AD";
        platform: string;
        captionAr: string;
        captionEn: string;
        hashtags: string;
        cta: string;
        adHeadline: string;
        adBody: string;
        hookScript: string;
        aiProvider: string;
    }[] = [];

    const provider = process.env.AI_PROVIDER || "openai";
    const errors: string[] = [];

    for (let weekIdx = 0; weekIdx < totalWeeks; weekIdx++) {
        const weekDays = weeks[weekIdx];
        const prompt = buildWeeklyContentPrompt(
            {
                name: client.company || client.name,
                industry: profile.industry,
                niche: profile.niche,
                targetAudience: profile.targetAudience,
                brandTone: profile.brandTone,
                platforms: profile.platforms,
                goals: profile.goals,
                competitors: profile.competitors,
            },
            weekIdx + 1,
            totalWeeks
        );

        try {
            console.log(`[Content Gen] Generating week ${weekIdx + 1}/${totalWeeks} via ${provider}...`);
            const rawResponse = await callAI(prompt);
            console.log(`[Content Gen] Week ${weekIdx + 1} raw response length: ${rawResponse.length}`);

            let parsed: { posts?: AIPost[] };
            try {
                parsed = JSON.parse(rawResponse);
            } catch (parseErr) {
                console.error(`[Content Gen] Failed to parse week ${weekIdx + 1} response:`, rawResponse.substring(0, 500));
                errors.push(`Week ${weekIdx + 1}: JSON parse error`);
                continue;
            }

            const posts: AIPost[] = parsed.posts || [];
            console.log(`[Content Gen] Week ${weekIdx + 1}: ${posts.length} posts parsed`);

            if (posts.length === 0) {
                errors.push(`Week ${weekIdx + 1}: AI returned empty posts array`);
                continue;
            }

            for (const post of posts) {
                const dayIndex = Math.min(
                    Math.max(0, post.dayIndex || 0),
                    weekDays.length - 1
                );
                const date = weekDays[dayIndex];
                if (!date) continue;

                const validTypes = ["FEED", "STORY", "REEL", "AD"];
                const postType = validTypes.includes(post.postType)
                    ? post.postType
                    : "FEED";

                allPosts.push({
                    date,
                    postType: postType as "FEED" | "STORY" | "REEL" | "AD",
                    platform: post.platform || profile.platforms[0] || "instagram",
                    captionAr: post.captionAr || "",
                    captionEn: post.captionEn || "",
                    hashtags: post.hashtags || "",
                    cta: post.cta || "",
                    adHeadline: post.adHeadline || "",
                    adBody: post.adBody || "",
                    hookScript: post.hookScript || "",
                    aiProvider: provider,
                });
            }
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            console.error(`[Content Gen] Error generating week ${weekIdx + 1}:`, errMsg);
            errors.push(`Week ${weekIdx + 1}: ${errMsg}`);
        }
    }

    // Batch create all posts
    if (allPosts.length > 0) {
        await prisma.contentPost.createMany({
            data: allPosts.map((p) => ({
                planId: plan.id,
                date: p.date,
                postType: p.postType,
                platform: p.platform,
                captionAr: p.captionAr,
                captionEn: p.captionEn,
                hashtags: p.hashtags,
                cta: p.cta,
                adHeadline: p.adHeadline,
                adBody: p.adBody,
                hookScript: p.hookScript,
                aiProvider: p.aiProvider,
            })),
        });

        await prisma.contentPlan.update({
            where: { id: plan.id },
            data: { status: "generated" },
        });

        return { success: true, postsCreated: allPosts.length };
    }

    // If no posts were created, return the errors
    await prisma.contentPlan.update({
        where: { id: plan.id },
        data: { status: "error" },
    });

    return {
        success: false,
        postsCreated: 0,
        error: errors.length > 0 ? errors.join("; ") : "No content generated",
    };
}
