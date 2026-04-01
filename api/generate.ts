import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

export interface Slide {
  slideNumber: number;
  title: string;
  body: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  const {
    text,
    title,
    slideCount = 5,
    language = "English",
  } = req.body as {
    text: string;
    title?: string;
    slideCount?: number;
    language?: string;
  };

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: 'Missing or invalid "text" field' });
  }

  const truncatedText = text.slice(0, 20000);

  const prompt = `You are a professional presentation designer. Based on the document content below, create exactly ${slideCount} carousel slides.

${title ? `The carousel title is: "${title}"` : ""}

IMPORTANT: Write ALL slide content (titles and body text) in ${language}. Do not use any other language.

Document content:
---
${truncatedText}
---

Return ONLY a valid JSON array with exactly ${slideCount} objects. Each object must have:
- "title": a short, punchy headline (max 8 words)
- "body": 1-3 sentences of supporting content (max 60 words)

Example format:
[
  { "title": "Slide Title Here", "body": "Supporting content goes here in 1-3 clear sentences." }
]

Return ONLY the JSON array, no markdown, no explanation.`;

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = response.text?.trim() ?? "";

    // Strip potential markdown code fences
    const jsonString = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const rawSlides = JSON.parse(jsonString) as Array<{
      title: string;
      body: string;
    }>;

    const slides: Slide[] = rawSlides.slice(0, slideCount).map((s, i) => ({
      slideNumber: i + 1,
      title: s.title ?? `Slide ${i + 1}`,
      body: s.body ?? "",
    }));

    return res.status(200).json({ slides });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Gemini API error:", message);
    return res.status(500).json({ error: message });
  }
}
