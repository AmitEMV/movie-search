import { generateEmbedding } from "@/app/lib/embedding";
import { NextResponse } from "next/server";
import { getMovieTitleFromRecommendationQuery, isRecommendationQuery } from "@/app/lib/recommendationQuery";
import { getMovieDetailsFromTitle } from "@/app/lib/getMovieDetails";
import { getMatchingMovies } from "@/app/lib/getMatchingMovies";
import { getRecommendedMovies } from "@/app/lib/getRecommendationMovies";
import { planQuery } from "@/app/lib/planner";

interface SearchRequest {
  searchTerm: string;
}

// Simple logic to determine if the query should go through the planner path
function shouldUsePlanner(searchTerm: string): boolean {
  return /(after|before|above|below|top rated|rating|released|year)/i
    .test(searchTerm);
}

export async function POST(request: Request) {
  const { searchTerm } = await request.json() as SearchRequest;
  
  if (!searchTerm || searchTerm.trim() === "") {
    return NextResponse.json({ results: [] });
  }

  if (typeof searchTerm !== "string") {
    return NextResponse.json({ error: "Search term must be a string" }, { status: 400 });
  }

  const isRecommendation = isRecommendationQuery(searchTerm);

  if(isRecommendation) {
    // For recommendation queries, we use a different SQL query to match the movies similarity based on the embedding
    const movieTitle = getMovieTitleFromRecommendationQuery(searchTerm);
    if (!movieTitle) {
      return NextResponse.json({ error: "Invalid recommendation query" }, { status: 400 });
    }

    const movieDetails = await getMovieDetailsFromTitle(movieTitle);
    if (!movieDetails) {
      return NextResponse.json({ error: "Movie not found for recommendation" }, { status: 404 });
    }
    try {
      const results = await getRecommendedMovies(movieDetails.embedding, movieDetails.id);
      return NextResponse.json({ results });
    } catch (error) {
      console.error("Error searching movies:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  } 
  
  const parsedQuery = await planQuery(searchTerm);
  const embeddingResponse = await generateEmbedding(parsedQuery.semanticQuery);

  if (embeddingResponse.error) {
    return NextResponse.json(
      { error: embeddingResponse.error },
      { status: 500 }
    );
  }

  const vector = `[${embeddingResponse.embedding.join(",")}]`;

  if(shouldUsePlanner(searchTerm)) {
    // Queries that need planner so that it will return the filters and semantic query term
    try {

      const results = await getMatchingMovies({vector,
          filters: parsedQuery.filters,
          semanticQuery:
            parsedQuery.semanticQuery
        });

      return NextResponse.json({ parsedQuery,results});

    } catch (error) {
      console.error("Error searching movies:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  // Direct semantic search without filters, for simple queries that don't need planner
  try {
    const results = await getMatchingMovies({ vector, filters: {}, semanticQuery: searchTerm });
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error searching movies:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
  
}
