interface ClientProfile {
    name: string;
    industry: string;
    niche: string;
    targetAudience: string;
    brandTone: string;
    platforms: string[];
    goals: string;
    competitors: string;
}

export function buildWeeklyContentPrompt(
    client: ClientProfile,
    week: number,
    totalWeeks: number
): string {
    const platformList = client.platforms.join(", ");

    return `
You are a social media strategist for a ${client.industry} brand in Saudi Arabia / Middle East.

Brand: ${client.name}
Industry: ${client.industry}
Niche: ${client.niche}
Tone: ${client.brandTone}
Target Audience: ${client.targetAudience}
Platforms: ${platformList}
Goals: ${client.goals}
Competitors: ${client.competitors || "Not specified"}

Generate Week ${week} of ${totalWeeks} content plan. This week should contain EXACTLY 3 posting days.

For each posting day, generate:
1. One FEED post with full caption in Arabic + English
2. One STORY idea with a short description
3. If this is week 1 or week 3, also include one REEL/video concept with hook and script outline

For week 2 and week 4, include one AD copy with headline, body text, and CTA.

Return as JSON with this exact structure:
{
  "posts": [
    {
      "dayIndex": 0,
      "postType": "FEED",
      "platform": "instagram",
      "captionAr": "Arabic caption here",
      "captionEn": "English caption here",
      "hashtags": "#hashtag1 #hashtag2 #hashtag3",
      "cta": "Call to action text"
    },
    {
      "dayIndex": 0,
      "postType": "STORY",
      "platform": "instagram",
      "captionAr": "Story idea in Arabic",
      "captionEn": "Story idea in English",
      "hashtags": "",
      "cta": ""
    },
    {
      "dayIndex": 1,
      "postType": "FEED",
      "platform": "instagram",
      "captionAr": "...",
      "captionEn": "...",
      "hashtags": "...",
      "cta": "..."
    }
  ]
}

dayIndex should be 0, 1, or 2 representing the three posting days of this week.
postType must be one of: FEED, STORY, REEL, AD
Make the content creative, engaging, and culturally relevant to the Saudi/Gulf audience.
Captions should be substantial (2-4 sentences minimum).
  `.trim();
}
