import { query } from "./db";

import { SearchFilters } from "./planner";

interface GetMatchingMoviesInput {
  vector: string;
  filters: SearchFilters;
  semanticQuery: string;
}

const lowRatingKeywords = [
  "bad",
  "terrible",
  "worst",
  "trash",
  "awful",
  "so bad it's good"
];

export async function getMatchingMovies({
  vector,
  filters,
  semanticQuery
}: GetMatchingMoviesInput): Promise<unknown> {

  const conditions: string[] = [
    "embedding IS NOT NULL"
  ];

  const values: unknown[] = [vector];

  if (filters.yearGt) {
    values.push(filters.yearGt);
    conditions.push(`year > $${values.length}`);
  }

  if (filters.yearLt) {
    values.push(filters.yearLt);
    conditions.push(`year < $${values.length}`);
  }

  if (filters.ratingGt) {
    values.push(filters.ratingGt);
    conditions.push(`vote_average > $${values.length}`);
  }

  if (filters.ratingLt) {
    values.push(filters.ratingLt);
    conditions.push(`vote_average < $${values.length}`);
  } else {
    conditions.push('vote_count > 1000');
  }

  if(!filters.ratingGt && !filters.ratingLt) {
      const lowerCaseQuery = semanticQuery.toLowerCase();
      const containsLowRatingKeyword = lowRatingKeywords.some(keyword =>
        lowerCaseQuery.includes(keyword)
      );
      if (containsLowRatingKeyword) {
        conditions.push(`vote_average < 5`);
      } else {
        conditions.push(`vote_average >= 5`);
      }
  }

  let genreBoostQuery = "";

  if (filters.genres?.length) {

    const genreConditions = filters.genres.map((genre) => {
      values.push(`%${genre}%`);

      return `genre ILIKE $${values.length}`;
    });

    conditions.push(
      `(${genreConditions.join(" OR ")})`
    );

    genreBoostQuery = filters.genres.map((genre) => `
      CASE
        WHEN genre ILIKE '%${genre}%'
        THEN -0.05
        ELSE 0
      END
    `).join(" + ");
  }

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
    ${conditions.join(" AND ")}

  ORDER BY final_score

  LIMIT 10;
`;

  try {
    const results = await query(sqlQuery, values);
    return results;
  } catch (error) {

    console.error(
      "Error fetching matching movies:",
      error
    );

    throw new Error(
      "Unable to fetch matching movies"
    );
  }
}