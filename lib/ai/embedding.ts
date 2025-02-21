import { embed, embedMany } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { db } from '../db'
import { cosineDistance, desc, gt, sql } from 'drizzle-orm'
import { embeddings } from '../db/schema/embeddings'

const siliconFlow = createOpenAI({
  apiKey: process.env.SILICONFLOW_API_KEY,
  baseURL: process.env.SILICONFLOW_API_URL
})

const embeddingModel = siliconFlow.embedding('BAAI/bge-m3')

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter(i => i !== '')
}

/**
 * 生成多个嵌入
 * @param value 
 * @returns 
 */
export const generateEmbeddings = async (
  value: string,
): Promise<
  Array<{
    embedding: number[]
    content: string 
  }>
> => {
  const chunks = generateChunks(value)
  console.log(chunks)
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks
  })
  console.log(embeddings)
  return embeddings.map((embedding, index) => ({
    embedding,
    content: chunks[index]
  }))
}

/**
 * 生成单个嵌入
 * @param value 
 * @returns 
 */
export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', '')
  const { embedding } = await embed({
    model: embeddingModel,
    value: input
  })
  return embedding
}

/**
 * 嵌入用户查询，在数据库中搜索相似的，并返回
 * @param userQuery 
 * @returns 
 */
export const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery)
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded,
  )})`
  const similarGuides = await db
    .select({ name: embeddings.content, similarity })
    .from(embeddings)
    .where(gt(similarity, 0.5))
    .orderBy(t => desc(t.similarity))
    .limit(4)
  return similarGuides
}
