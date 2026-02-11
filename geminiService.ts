
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGameCommentary = async (
  score: number, 
  level: number, 
  status: 'victory' | 'defeat' | 'streak'
) => {
  try {
    const prompt = `You are a hype-man game commentator for a retro-neon brick breaker game.
    Current Score: ${score}
    Level: ${level}
    Event: ${status}
    
    Provide a short, punchy, 1-sentence commentary in Korean to encourage or react to the player. 
    Make it sound cool, futuristic, and exciting. Keep it under 20 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 100,
      }
    });

    return response.text?.trim() || "계속해서 나아가세요!";
  } catch (error) {
    console.error("Gemini commentary error:", error);
    return "엄청난 플레이입니다!";
  }
};
