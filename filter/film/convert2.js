import axios from 'axios';
import fs from 'fs/promises';

// TMDB API credentials
const baseUrl = 'https://api.themoviedb.org/3';
const apiKey = '91f480a74749344a6e1b15f5ead2cb12';

// VOD API credentials and URL
const vodApiUrl = 'http://763025459169.cdn-fug.com:8080/player_api.php';
const username = '115763054352463';
const password = 'iuadobbh3v';

// Function to fetch genres from TMDB
async function fetchTmdbGenres() {
  try {
    const response = await axios.get(`${baseUrl}/genre/movie/list`, {
      params: { api_key: apiKey, language: 'en-US' },
    });
    return response.data.genres; // Returns an array of genres
  } catch (error) {
    console.error('Error fetching TMDB genres:', error.message);
    return [];
  }
}

// Function to fetch VOD categories
async function fetchVodCategories() {
  try {
    const response = await axios.get(vodApiUrl, {
      params: { username, password, action: 'get_vod_categories' },
    });
    return response.data; // Returns the list of VOD categories
  } catch (error) {
    console.error('Error fetching VOD categories:', error.message);
    return [];
  }
}

// Function to create a mapping of VOD category IDs to TMDB genres
async function createCategoryToGenreMap() {
  try {
    const [tmdbGenres, vodCategories] = await Promise.all([
      fetchTmdbGenres(),
      fetchVodCategories(),
    ]);

    const categoryToGenreMap = {};

    for (const genre of tmdbGenres) {
      for (const category of vodCategories) {
        if (category.category_name.toLowerCase().includes(genre.name.toLowerCase())) {
          categoryToGenreMap[category.category_id] = genre.name;
      }
      
      }
    }

    return categoryToGenreMap;
  } catch (error) {
    console.error('Error creating category-to-genre map:', error);
    return {};
  }
}

// Function to convert movies and add genres
function convertToMovieObjects(moviesArray, categoryToGenreMap) {
  return moviesArray.map(movie => {
    const rating = parseFloat(movie.rating) || 0;
   

    // Map category IDs to genre names
    const genres = (movie.category_ids || [])
      .map(categoryId => categoryToGenreMap[categoryId])
      .filter(Boolean); // Remove undefined genres

      
    return {
      name: movie.name,
      imagePath: String(movie.stream_icon),
      indexer: String(movie.stream_id),
      isAdult: movie.is_adult === 1,
      extension: movie.container_extension,
      tmdb: String(movie.tmdb),
      rating: rating,
      genres: genres,
      added: new Date(movie.added * 1000), // Converts UNIX timestamp to Date object
    };
  });
}

// Function to process movies and write output
async function processMovies() {
  try {
    // Fetch and prepare the category-to-genre map
    const categoryToGenreMap = await createCategoryToGenreMap();

    // Read VOD streams data
    const data = await fs.readFile('vod_streams.json', 'utf-8');
    const moviesArray = JSON.parse(data);

    // Convert movies to desired format
    const movieObjects = convertToMovieObjects(moviesArray, categoryToGenreMap);

    // Categorize movies based on TMDB ID and image path
    const moviesWithTmdbOrImage = [];
    const moviesWithoutTmdbOrImage = [];

    for (const movie of movieObjects) {
      const hasTmdbId = movie.tmdb && movie.tmdb.trim().length > 0;
      const hasTmdbImage = movie.imagePath.startsWith("https://image.tmdb.org/");

      if (hasTmdbId || hasTmdbImage) {
        moviesWithTmdbOrImage.push(movie);
      } else {
        moviesWithoutTmdbOrImage.push(movie);
      }
    }
    const movies={
      "movies":moviesWithTmdbOrImage
    }
    // Write categorized movies to separate JSON files
    await fs.writeFile('2.json', JSON.stringify(movies, null, 2));
    await fs.writeFile('converted_movies_without_tmdb.json', JSON.stringify(moviesWithoutTmdbOrImage, null, 2));

    console.log('Movies successfully processed and categorized.');
  } catch (error) {
    console.error('Error processing movies:', error);
  }
}

// Run the process
processMovies();
