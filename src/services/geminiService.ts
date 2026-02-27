import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const TARGET_URL = "https://indigloo.ai";

export async function* sendMessageStream(messages: Message[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // We use the last message as the prompt, but we could also pass history
  // However, urlContext works best when the prompt is clear about what to summarize/query
  const userPrompt = messages[messages.length - 1].text;
  
  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `Based on the content of ${TARGET_URL}, please answer the following: ${userPrompt}` }]
      }
    ],
    config: {
      tools: [{ urlContext: {} }],
      systemInstruction: `You are an expert assistant for Indigloo AI. 
      Your goal is to provide accurate information about Indigloo AI based on the provided URL context.
      If the information is not available in the context, state that you don't know rather than making things up.
      Be professional, concise, and helpful.`
    },
  });

  for await (const chunk of response) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}
