import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateWithGemini(prompt: string): Promise<string> {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const response = await genai.models.generateContent({
        model,
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: `You are an expert social media strategist for businesses in the Middle East. You create engaging, culturally relevant content in Arabic and English. Always return valid JSON.\n\n${prompt}`,
                    },
                ],
            },
        ],
        config: {
            temperature: 0.8,
            responseMimeType: "application/json",
        },
    });

    return response.text || "{}";
}
