"use client";

import { useState } from "react";
import { toast } from "sonner";
import MovieCard from "./components/MovieCard";
import { PuffLoader } from "react-spinners";

interface Movie {
  id: number;
  title: string;
  description: string;
  genre: string;
  year: number;
  vote_average: number;
}

export default function Home() {
  const [searchText, setSearchText] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          searchTerm: searchText
        }),
      });

      const data = await response.json();

      if(data.error) {
        setHasSearched(false);
        setSearchResults([]);
        toast("An error occurred while trying to search", { duration: 2000, closeButton: true });
        return;
      }

      setSearchResults(data.results?.rows || []);
      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setHasSearched(false);
      setSearchResults([]);
      toast("An error occurred while trying to search", { duration: 2000, closeButton: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="page">

        <section className="hero">

          <div className="heroHeader">
            <div className="logoBox">
              <span>🎬</span>
            </div>

            <div>
              <h1>Movie Search</h1>

              <p>
                Search movies using natural language queries.
              </p>
            </div>
          </div>

          <form className="searchForm" onSubmit={handleSubmit}>

            <div className="searchInputWrapper">
              <span className="searchIcon">
                🔍
              </span>

              <input
                type="text"
                name="searchTerm"
                id="searchTerm"
                placeholder="e.g. space movies with time travel"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <button type="submit">
              Search
            </button>

          </form>

        </section>

        <section className="resultsSection">

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <PuffLoader color="#a1a1aa" size={75} />
              <p className="mt-4 text-zinc-500">Searching</p>
            </div>
          ) : !hasSearched ? (
            <div className="emptyState">
              <p>Search for something to see results here</p>
            </div>
          ) : (
            <>
              <div className="resultsHeader">
                <h2>Results</h2>

                <p>
                  {searchResults.length} {searchResults.length === 1 ? "result" : "results"}
                </p>
              </div>

              <div className="resultsGrid">

                {searchResults.map((movie) => (
                  <MovieCard 
                    key={movie.id}
                    title={movie.title}
                    genre={movie.genre}
                    vote_average={movie.vote_average}
                    description={movie.description}
                    year={movie.year}
                  />
                ))}

              </div>
            </>
          )}

        </section>

      </main>

    </div>
  );
}
