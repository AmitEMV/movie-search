"use client";

import { useState } from "react";

interface MovieCardProps {
  title: string;
  genre: string;
  vote_average: number;
  description: string;
  year: number;
}

export default function MovieCard({ title, genre, vote_average, description, year }: MovieCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isLongDescription = description.length > 110;
  const displayDescription = isExpanded || !isLongDescription 
    ? description 
    : `${description.substring(0, 110)}... `;

  return (
    <article className="movieCard">
      <div className="movieContent">
        <div className="movieTop">
          <div>
            <h3>{title}</h3>
            <div className="movieMeta">
              <span>{year}</span>
            </div>
          </div>
          <div className="ratingBox flex items-center gap-3">
            <span className="rating">{vote_average}</span>
            <span className="text-xl">⭐</span>
          </div>
        </div>
        <p className="overview">
          {displayDescription}
          {isLongDescription && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-500 hover:text-blue-700 hover:underline ml-1 font-medium"
            >
              {isExpanded ? "less" : "more"}
            </button>
          )}
        </p>
        <div className="genreList">
          {genre?.split(",").map((g) => (
            <span key={g.trim()}>{g.trim()}</span>
          ))}
        </div>
      </div>
    </article>
  );
}