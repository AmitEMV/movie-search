"use client";

import { useState } from "react";

export default function Home() {
  const [searchText, setSearchText] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    console.log("Search results:", data);
    setHasSearched(true);
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

          {!hasSearched ? (
            <div className="emptyState">
              <p>Search for something to see results here</p>
            </div>
          ) : (
            <>
              <div className="resultsHeader">
                <h2>Results</h2>

                <p>
                  {/* result count */}
                </p>
              </div>

              <div className="resultsGrid">

                {/* map results here */}

                <article className="movieCard">

                  <div className="movieContent">

                    <div className="movieTop">

                      <div>
                        <h3>
                          {/* movie title */}
                        </h3>

                        <div className="movieMeta">
                          <span>
                            {/* release year */}
                          </span>

                          <span>•</span>

                          <span>
                            {/* rating */}
                          </span>
                        </div>
                      </div>

                      <div className="ratingBox">
                        <span className="rating">
                          {/* vote average */}
                        </span>

                        <span className="ratingLabel">
                          Rating
                        </span>
                      </div>

                    </div>

                    <p className="overview">
                      {/* movie overview */}
                    </p>

                    <div className="genreList">

                      {/* map genres here */}

                      <span>
                        {/* genre */}
                      </span>

                    </div>

                  </div>

                </article>

              </div>
            </>
          )}

        </section>

      </main>

    </div>
  );
}
