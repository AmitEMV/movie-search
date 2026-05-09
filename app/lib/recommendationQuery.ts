const recommendationKeywords = ["similar to", "movies like", "recommend movies like", "suggest movies like", "movies similar to"];

export function isRecommendationQuery(query: string): boolean {
  return recommendationKeywords.some(keyword => query.toLowerCase().includes(keyword));
}

export function getMovieTitleFromRecommendationQuery(query: string): string | null {
  const lowerCaseQuery = query.toLowerCase();
  
  for (const keyword of recommendationKeywords) {
    const index = lowerCaseQuery.indexOf(keyword);

    if (index !== -1) {
      const movieTitle = query
        .slice(index + keyword.length)
        .trim();

      return movieTitle || null;
    }
  }

  return null;
}