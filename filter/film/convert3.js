import fs from "fs";

// Input and Output File Paths
const inputFilePath = "./2.json"; // Input file path
const outputFilePath = "./3.json"; // Output file path


function joinNonUniqueMovies(movies) {
  const seenTmdb = {};
  const seenImagePath = {};
  const uniqueMovies = [];

  for (const movie of movies) {
    const tmdbKey = movie.tmdb;
    const imagePathKey = movie.imagePath;

    if (!seenTmdb[tmdbKey] && !seenImagePath[imagePathKey]) {
      // Both tmdb and imagePath are unique
      seenTmdb[tmdbKey] = movie;
      seenImagePath[imagePathKey] = movie;
      uniqueMovies.push({ ...movie }); // Add a copy
    } else {
      let existingMovie;
      if (seenTmdb[tmdbKey]) {
        existingMovie = seenTmdb[tmdbKey];
      } else {
        existingMovie = seenImagePath[imagePathKey];
      }
      // Merge data into the existing movie
      existingMovie.indexer = existingMovie.indexer.concat(movie.indexer);
      existingMovie.extension = existingMovie.extension.concat(movie.extension);
     
      // Merge other fields as needed, handle non-array fields carefully
    }
  }

  return uniqueMovies;
}
// Read the input JSON
fs.readFile(inputFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading input file:", err);
    return;
  }

  try {
    // Parse the input data
    const movies = JSON.parse(data).movies;

    // Filter out invalid movies (both tmdb and imagePath must not be empty)
    const validMovies = movies.filter(movie => movie.tmdb?.trim() && movie.imagePath?.trim());

    // Group movies by unique `tmdb`
    const groupedMoviesMap = new Map();

    validMovies.forEach(movie => {
      const key = movie.tmdb;

      if (!groupedMoviesMap.has(key)) {
        // Add as a new leader
        groupedMoviesMap.set(key, {
          ...movie,
          indexer: [...[].concat(movie.indexer)],
          extension: [...[].concat(movie.extension)],
          genres: [...[].concat(movie.genres)],
          seenby: 0,
          type_: "MOVIE"
        });
      } else {
        // Merge duplicate data into the group leader
        const leader = groupedMoviesMap.get(key);
        leader.indexer.push(...[].concat(movie.indexer));
        leader.extension.push(...[].concat(movie.extension));
        leader.genres.push(...[].concat(movie.genres));
        leader.rating = Math.max(leader.rating || 0, movie.rating || 0);
      }
    });

    // Convert the map to an array
    const groupedMovies = Array.from(groupedMoviesMap.values());

   const uniqueMovies = joinNonUniqueMovies(groupedMovies);

   
    // Write the output JSON
    fs.writeFile(outputFilePath, JSON.stringify({ movies: uniqueMovies }, null, 2), "utf8", err => {
      if (err) {
        console.error("Error writing output file:", err);
      } else {
        console.log("Output successfully written to", outputFilePath);
      }
    });
  } catch (error) {
    console.error("Processing error:", error.message);
  }
});
