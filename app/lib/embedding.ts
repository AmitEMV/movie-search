export interface EmbeddingResponse {
  embedding: number[];
  error?: string;
}

export async function generateEmbedding(searchTerm: string): Promise<EmbeddingResponse> {
  if (!searchTerm || searchTerm.trim() === "") {
    return {
      embedding: [],
      error: "Search term is required"
    };
  }

  try {
    const response = await fetch(
      process.env.EMBEDDINGS_ENDPOINT! + "api/embeddings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "nomic-embed-text",
          prompt: searchTerm,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      embedding: data.embedding
    };
  } catch (error) {
    console.error("Error generating embedding:", error);
    return {
      embedding: [],
      error: "Failed to generate embedding"
    };
  }
}