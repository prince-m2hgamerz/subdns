import { generateEmbedding } from "./embeddings";
import { supabase } from "@/lib/supabase";
import { MATCH_THRESHOLD, MATCH_COUNT } from "./config";

export interface KnowledgeResult {
  id: string;
  chunk_text: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export async function searchKnowledge(
  query: string
): Promise<KnowledgeResult[]> {
  const embedding = await generateEmbedding(query, "query");

  const { data, error } = await supabase.rpc("match_knowledge_chunks", {
    query_embedding: embedding,
    match_threshold: MATCH_THRESHOLD,
    match_count: MATCH_COUNT,
  });

  if (error) {
    console.error("Knowledge search error:", error);
    return [];
  }

  return (data as KnowledgeResult[]) ?? [];
}

export function formatKnowledgeContext(results: KnowledgeResult[]): string {
  if (results.length === 0) return "";

  const sections = results.map(
    (r, i) =>
      `[Knowledge ${i + 1}] (relevance: ${(r.similarity * 100).toFixed(0)}%${r.metadata?.source ? `, source: ${r.metadata.source}` : ""})\n${r.chunk_text}`
  );

  return `\n\nRETRIEVED PLATFORM KNOWLEDGE:\n${sections.join("\n\n---\n\n")}`;
}
