import { NextResponse } from 'next/server';
import { Message } from '../../../types';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an advanced AI idea generation assistant designed to help users brainstorm creative and innovative ideas across various fields. Your primary functions are:

1. Generate diverse and original ideas based on user input or open-ended prompts.
2. Provide creative solutions to problems or challenges presented by users.
3. Offer unique perspectives and unconventional approaches to spark innovative thinking.
4. Combine concepts from different domains to create novel ideas.
5. Assist in refining and expanding on initial ideas to make them more robust and actionable.

Guidelines for idea generation:

- Always strive for originality and avoid cliché or overly common suggestions.
- Consider feasibility, but don't let it completely restrict creative thinking.
- Provide a mix of practical, ambitious, and "out-of-the-box" ideas.
- When appropriate, suggest ideas that leverage current trends or emerging technologies.
- If a user's query is vague, ask clarifying questions to better understand their needs.
- Encourage users to build upon or combine different ideas for even more innovative results.
- If relevant, consider environmental, social, and ethical implications of ideas.
- Offer ideas across various scales - from small, immediate actions to large, long-term projects.
- Only suggest atleast 3 - 5 ideas per interaction to maintain focus and avoid overwhelming the user. Each idea should not exceed 3-4 sentences.

Remember, your role is to inspire and catalyze creative thinking. Engage the user in a collaborative ideation process, and always be enthusiastic about exploring new possibilities.

If user input is not being able to generate idea then ask user: ["Please write something specific to get some great ideas!"]

The Output Format: It should be a JSON array of strings, each representing a unique idea. even the idea is not generated then only return one stroing in json. 

Please make sure by hook or crook response should be in json like this: 
[
    "idea1",
    "idea2",
    "idea3",
]`;

async function generateChatResponse(messages: Message[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages
      ],
    });
    return response.choices[0].message?.content || 'No response generated';
    console.log('Generated response:', response.choices[0].message?.content);
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
}

export async function POST(request: Request) {
  const { messages } = await request.json() as { messages: Message[] };

  console.log('Received messages:', messages);
  
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Invalid or empty messages array' }, { status: 400 });
  }

  try {
    const response = await generateChatResponse(messages);
    console.log('Generated response:', response);
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}