import { NextResponse } from "next/server";
import { Message } from "../../../types";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI idea generation assistant that:
1. For idea generation requests: Provide one innovative idea in 3-4 sentences as a single paragraph
2. For requests to save/store/remember/keep the last idea: Respond with "SAVE_INTENT" 
3. For any other request: Provide a natural conversational response

Focus on quality and practicality. Format ideas in plain text without special characters.`;

async function generateChatResponse(messages: Message[]): Promise<{
  content: string;
  intent: "save" | "generate" | "other";
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    });

    const content =
      response.choices[0].message?.content || "No response generated";
    const intent = content === "SAVE_INTENT" ? "save" : "generate";

    // console.log("Generated response:", content);
    return { content, intent };
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return {
      content: "Sorry, I encountered an error. Please try again.",
      intent: "other",
    };
  }
}

export async function POST(request: Request) {
  const { messages } = (await request.json()) as { messages: Message[] };

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "Invalid or empty messages array" },
      { status: 400 }
    );
  }

  try {
    const response = await generateChatResponse(messages);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in chat handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
