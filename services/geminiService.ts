import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateColoringPage = async (userPrompt: string): Promise<string> => {
  try {
    // We construct a specific prompt to ensure the output is a coloring page suitable for children
    const enhancedPrompt = `
      Create a black and white line art coloring page for a preschool child (PAUD).
      Subject: ${userPrompt}.
      Style: Simple, thick clean lines, cartoon style, cute, high contrast.
      Background: Pure white.
      Constraints: No shading, no grayscale, no colors, no complex details. Just outlines.
    `;

    // Using gemini-2.5-flash-image for generation (Nano Banana)
    // As per guidelines: call generateContent for nano banana series.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: enhancedPrompt }
        ]
      },
      config: {
        // Nano banana doesn't support responseMimeType or responseSchema
        // Just standard generation
      }
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error("No content generated");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const base64Data = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${base64Data}`;
      }
    }

    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Error generating coloring page:", error);
    throw error;
  }
};