import { query } from "./db";

export interface MovieDetails {
  id: number;
  title: string;
  embedding: string;
}

export async function getMovieDetailsFromTitle(movieTitle: string): Promise<MovieDetails | null> {
  try {
    const results = await query("SELECT id, title, embedding FROM items WHERE LOWER(title) = LOWER($1) LIMIT 1;", [movieTitle]);
    
    if (results.rowCount === 0) {
      return null;
    }
    
    return results.rows[0] as MovieDetails;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw new Error("Unable to fetch movie details");
  }
}