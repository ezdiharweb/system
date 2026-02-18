import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateWithOpenAI(prompt: string): Promise<string> {
    const model = process.env.OPENAI_MODEL || "gpt-4o";

    const response = await openai.chat.completions.create({
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
    });

    return response.choices[0]?.message?.content || "{}";
}
