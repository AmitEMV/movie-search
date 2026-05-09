This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Running the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## About the App

Simple movie search app using the TMDB data, built with PostgreSQL + pgvector + Ollama, with search from a simple Next.js app.

Movie metadata is imported from TMDB dataset and the aim is to try out natural-language search using vector embeddings instead of traditional keyword-only matches.

TMDB dataset CSV → raw_movies → cleaned items table → embeddings. The cleaned table contains the embeddings along with
other basic movie fields.

Embeddings are generated locally using the model `nomic-embed-text`. The embedding input format is `Title + Genres + Keywords + Overview`

NOTE:
This project uses movie metadata derived from the TMDB dataset. TMDB is not affiliated with this project.
THe project is intended for learning/non-commercial experimentation use only.

## Search Behaviour 

Search uses LLM (qwen2.5:14b), embeddings, and PostgreSQL vector search. Search term is first sent to Qwen running locally via Ollama, where the query is converted into structured JSON containing:

* intent classification (`semantic_search`, `recommendation`, or `filtered_search`)
* a cleaned semantic query
* structured filters (genres, year ranges, ratings, etc.)

The semantic portion of the query is converted into embeddings using `nomic-embed-text`. The application then performs hybrid retrieval using:

* semantic similarity search via pgvector
* usual SQL filters for ratings, genres, and release years
* custom ranking boosts for popularity and ratings

This separates:

* semantic understanding (embeddings)
* query understanding/planning (LLM)
* exact filtering and ranking (PostgreSQL)

Generally, 3 separate search paths in this (not perfect but fine for this small project):

* "movies like Interstellar" -> recommendation search
* "space movies about saving earth" -> direct semantic search
* "action movies after 2010 rated above 7" -> LLM-assisted query planning + hybrid search (semantic embeddings + SQL filters)


## App Screenshot

![App Screenshot](./screenshots/screenshot.png)

## Database

DDL generated from the existing table in Postgres (lost the initial create table statement)

```
CREATE TABLE public.items (
	id serial4 NOT NULL,
	title text NULL,
	description text NULL,
	genre text NULL,
	release_date date NULL,
	"year" int4 NULL,
	vote_average float8 NULL,
	keywords text NULL,
	embedding public.vector NULL,
	CONSTRAINT items_pkey PRIMARY KEY (id)
);
CREATE INDEX items_embedding_idx ON public.items USING ivfflat (embedding) WITH (lists='100');
```

## Some Stuff NOT Implemented

* No validations - zod would be a good candidate to have here
* No timeouts/AbortController - calls to local models can hang but that's not handled
* Streaming UI responses
* Query caching 
* Typo tolerance and fuzzy title matching using PostgreSQL pg_trgm similarity search
* ....