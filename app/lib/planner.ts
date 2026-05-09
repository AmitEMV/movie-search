export interface SearchFilters {
  genres?: string[];
  yearGt?: number;
  yearLt?: number;
  ratingGt?: number;
  ratingLt?: number;
}

export type SearchIntent =
  | "semantic_search"
  | "recommendation"
  | "filtered_search";

export interface ParsedQuery {
  intent: SearchIntent;
  semanticQuery: string;
  filters: SearchFilters;
}

const OLLAMA_URL = "http://localhost:11434/api/generate";

export async function planQuery(
  query: string
): Promise<ParsedQuery> {

  const prompt = `
You are a movie search query planner.

Return ONLY valid JSON.

semanticQuery must contain ONLY fuzzy semantic meaning.

Do NOT include:
- years
- ratings
- dates
- numeric filters
- comparison operators
- sorting terms

Those belong ONLY in filters.

Schema:
{
  "intent": "semantic_search | recommendation | filtered_search",
  "semanticQuery": "string",
  "filters": {
    "genres": ["string"],
    "yearGt": number,
    "yearLt": number,
    "ratingGt": number,
    "ratingLt": number
  }
}

User Query:
${query}
`;

  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "qwen2.5:14b",
      prompt,
      stream: false,
      format: "json"
    })
  });

  const data = await res.json();

  return JSON.parse(data.response);
}