import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { supabase } from "@/lib/supabase";
import { generateEmbedding } from "./embeddings";
import { KNOWLEDGE_TABLE, CHUNK_SIZE, CHUNK_OVERLAP } from "./config";

interface Chunk {
  chunk_text: string;
  metadata: Record<string, unknown>;
}

function readKnowledgeJSON(): Record<string, unknown> {
  const path = join(process.cwd(), "src", "lib", "ai-knowledge.json");
  if (!existsSync(path)) return {};
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw);
}

function chunkObject(
  obj: Record<string, unknown>,
  prefix: string = ""
): Chunk[] {
  const chunks: Chunk[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("_")) continue;

    const fullPath = prefix ? `${prefix}.${key}` : key;

    if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      const sub = value as Record<string, unknown>;
      const hasComplexChildren = Object.values(sub).some(
        (v) => typeof v === "object" && v !== null && !Array.isArray(v)
      );

      if (hasComplexChildren) {
        chunks.push(...chunkObject(sub, fullPath));
      } else {
        chunks.push({
          chunk_text: formatSection(fullPath, sub),
          metadata: { source: fullPath },
        });
      }
    } else if (Array.isArray(value)) {
      chunks.push({
        chunk_text: `${fullPath}: ${value.join(", ")}`,
        metadata: { source: fullPath },
      });
    } else {
      chunks.push({
        chunk_text: `${fullPath}: ${String(value)}`,
        metadata: { source: fullPath },
      });
    }
  }

  return chunks;
}

function formatSection(path: string, data: Record<string, unknown>): string {
  const lines = [`## ${path}`];
  for (const [k, v] of Object.entries(data)) {
    if (k.startsWith("_")) continue;
    if (Array.isArray(v)) {
      lines.push(`${k}:`);
      for (const item of v) lines.push(`- ${item}`);
    } else if (typeof v === "object" && v !== null) {
      lines.push(`${k}: ${JSON.stringify(v)}`);
    } else {
      lines.push(`${k}: ${v}`);
    }
  }
  return lines.join("\n");
}

function splitIntoChunks(text: string): string[] {
  if (text.length <= CHUNK_SIZE) return [text];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    let splitPoint = end;
    if (end < text.length) {
      const lastNewline = text.lastIndexOf("\n", end);
      if (lastNewline > start) splitPoint = lastNewline;
    }
    chunks.push(text.slice(start, splitPoint));
    start = splitPoint - CHUNK_OVERLAP;
  }
  return chunks;
}

export async function crawlKnowledge(): Promise<{ count: number; error?: string }> {
  try {
    const knowledge = readKnowledgeJSON();

    const rawChunks: Chunk[] = [];
    for (const [key, value] of Object.entries(knowledge)) {
      if (key === "_meta") continue;
      if (typeof value === "object" && value !== null) {
        rawChunks.push(
          ...chunkObject(value as Record<string, unknown>, key)
        );
      }
    }

    const expandedChunks: { text: string; meta: Record<string, unknown> }[] =
      [];
    for (const c of rawChunks) {
      const parts = splitIntoChunks(c.chunk_text);
      for (const p of parts) {
        expandedChunks.push({ text: p, meta: c.metadata });
      }
    }

    if (expandedChunks.length === 0) {
      return { count: 0, error: "No knowledge chunks found" };
    }

    const batchSize = 10;
    for (let i = 0; i < expandedChunks.length; i += batchSize) {
      const batch = expandedChunks.slice(i, i + batchSize);
      const embeddings = await Promise.all(
        batch.map((c) => generateEmbedding(c.text, "passage"))
      );

      const rows = batch.map((c, idx) => ({
        chunk_text: c.text,
        metadata: c.meta,
        embedding: embeddings[idx],
      }));

      const { error } = await supabase.from(KNOWLEDGE_TABLE).insert(rows);
      if (error) throw new Error(`Insert error: ${error.message}`);
    }

    return { count: expandedChunks.length };
  } catch (err: any) {
    return { count: 0, error: err.message };
  }
}

export async function clearKnowledge(): Promise<void> {
  await supabase.from(KNOWLEDGE_TABLE).delete().neq("id", "00000000-0000-0000-0000-000000000000");
}
