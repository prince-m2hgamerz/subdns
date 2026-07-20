import { NVIDIA_API_URL, EMBEDDING_MODEL } from "./config";

export async function generateEmbedding(
  text: string,
  type: "query" | "passage" = "passage"
): Promise<number[]> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_API_KEY not configured");

  const res = await fetch(`${NVIDIA_API_URL}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: text,
      model: EMBEDDING_MODEL,
      input_type: type,
      truncate: "END",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embedding API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.data[0].embedding;
}

export async function generateEmbeddings(
  texts: string[],
  type: "query" | "passage" = "passage"
): Promise<number[][]> {
  return Promise.all(texts.map((t) => generateEmbedding(t, type)));
}
