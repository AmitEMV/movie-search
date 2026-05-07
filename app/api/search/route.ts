import { generateEmbedding } from "@/app/lib/embedding";
import { query } from "../../lib/db";
import { NextResponse } from "next/server";

interface SearchRequest {
  searchTerm: string;
}

export async function POST(request: Request) {
  const { searchTerm } = await request.json() as SearchRequest;

  if (!searchTerm || searchTerm.trim() === "") {
    return NextResponse.json({ error: "Search term is required" }, { status: 400 });
  }

  if (typeof searchTerm !== "string") {
    return NextResponse.json({ error: "Search term must be a string" }, { status: 400 });
  }

  const embeddingResponse = await generateEmbedding(searchTerm);

  if (embeddingResponse.error) {
    return NextResponse.json({ error: embeddingResponse.error }, { status: 500 });
  }

  const vector = `[${embeddingResponse.embedding.join(",")}]`;

  try {
    const results = await query(
      "SELECT id, title, description, genre, year, vote_average, embedding <-> $1 AS similarity FROM items ORDER BY embedding <-> $1 LIMIT 10;",
      [vector]
    );
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error searching movies:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}