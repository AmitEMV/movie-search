import { query } from "./db";

export async function getRecommendedMovies(
  embedding: string,
  movieId: number
) : Promise<unknown> {
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

      (
        (embedding <-> $1)

        - (vote_average * 0.02)

        - (LOG(vote_count + 1) * 0.01)

      ) AS final_score

    FROM items

    WHERE
      id != $2
      AND vote_count > 1000
      AND vote_average > 5

    ORDER BY final_score
    LIMIT 10;
  `;

  const results = await query(sqlQuery, [
    embedding,
    movieId,
  ]);

  return results;
}