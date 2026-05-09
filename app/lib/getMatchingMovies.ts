import { query } from "./db";
import { genres } from "./genres";

export async function getMatchingMovies(vector: string): Promise<unknown> {
  const genreBoostQuery = genres
  .map(
    (genre) => `
      CASE
        WHEN genre ILIKE '%${genre}%'
        THEN -0.05
        ELSE 0
      END
    `
  )
  .join(" + ");

  const finalScoreQuery = `
  (
    (embedding <-> $1)

    - (vote_average * 0.02)

    - (LOG(vote_count + 1) * 0.01)

    ${genreBoostQuery ? `+ ${genreBoostQuery}` : ""}
  )
`;

const sqlQuery = `
  SELECT
    id,
    title,
    description,
    genre,
    year,
    vote_average,
    vote_count,

    embedding <-> $1 AS similarity,

    ${finalScoreQuery} AS final_score

  FROM items

  WHERE
    vote_count > 1000
    AND vote_average > 5

  ORDER BY final_score
  LIMIT 10;
`;

  try {
    const results = await query(sqlQuery, [vector]);
    return results;
  } catch (error) {
    console.error("Error fetching matching movies:", error);
    throw new Error("Unable to fetch matching movies");
  }
}