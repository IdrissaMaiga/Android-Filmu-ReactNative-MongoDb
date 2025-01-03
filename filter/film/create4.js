import { encrypt } from "../../api/lib/crypto.js"; // Assumes you have an encrypt function defined
import fs from "fs/promises";
import prismaclient from "../../api/lib/prisma.js"; // Prisma client instance

// Encrypts an array of indexers
const encryptIndexer = (indexers) => indexers.map((indexer) => encrypt(indexer.toString()));

// Main function to handle bulk insertion of movies
const insertMovies = async (jsonPath) => {
  try {
    const { movies } = JSON.parse(await fs.readFile(jsonPath, "utf8"));

    // Transform movies for Prisma createMany
    const movieData = movies.map((movie) => ({
      name: movie.name,
      indexer: encryptIndexer(movie.indexer),
      imagePath: movie.imagePath,
      isAdult: movie.isAdult,
      extension: movie.extension,
      tmdb: movie.tmdb,
      added: movie.added ? new Date(movie.added) : null,
      genres: movie.genres || [],
      rating: movie.rating || 1,
      type_: movie.type_ || "MOVIE",
      seenby: movie.seenby || 0,
    }));

    // Insert movies using createMany
    await prismaclient.movie.createMany({
      data: movieData,
    });

    console.log("All movies have been inserted successfully!");
  } catch (error) {
    console.error("Error inserting movies:", error);
  }
};

// Run the function
insertMovies("3.json"); // Path to your JSON file
