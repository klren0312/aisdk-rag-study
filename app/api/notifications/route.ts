import { createDeepSeek } from '@ai-sdk/deepseek'
import { streamObject } from 'ai';
import { notificationSchema } from './schema';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const customAI = createDeepSeek({
  apiKey: process.env.SILICONFLOW_API_KEY,
  baseURL: process.env.SILICONFLOW_API_URL
})


export async function POST(req: Request) {
  const context = await req.json();

  const result = streamObject({
    model: customAI('deepseek-ai/DeepSeek-V3'),
    schema: notificationSchema,
    prompt:
      `Generate 3 notifications for a messages app in this context:` + context,
  });

  return result.toTextStreamResponse();
}