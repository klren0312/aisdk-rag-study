import { createResource } from '@/lib/actions/resources'
import { createOpenAI } from '@ai-sdk/openai'

import { streamText, tool } from 'ai'
import { z } from 'zod'
import { findRelevantContent } from '@/lib/ai/embedding'

export const maxDuration = 30
const customAI = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_URL
})

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
      model: customAI('chatgpt-4o-latest'),
      messages,
      temperature: 1,
      system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls.
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
      tools: {
        addResource: tool({
          description: `add a resource to your knowledge base.
            If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
          parameters: z.object({
            content: z
              .string()
              .describe('the content or resource to add to the knowledge base'),
          }),
          execute: async ({ content }) => createResource({ content }),
        }),
        getInformation: tool({
          description: `get information from your knowledge base to answer questions.`,
          parameters: z.object({
            question: z.string().describe('the users question'),
          }),
          execute: async ({ question }) => findRelevantContent(question),
        }),
      },
      toolChoice: 'auto',
      toolCallStreaming: true,
      onError: (err) => {
        console.error(err)
      }
    });
  return result.toDataStreamResponse({
    getErrorMessage: errorHandler,
  })
}

export function errorHandler(error: unknown) {
  if (error == null) {
    return 'unknown error';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}
