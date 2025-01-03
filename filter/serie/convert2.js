import fs from 'fs/promises';
import path from 'path';

const inputFilePath = path.resolve('./series.json');
const outputFilePath = path.resolve('./2.json');

// Function to transform series data and write to a new file
const transformSeriesData = async () => {
  try {
    // Load the JSON file data
    const data = await fs.readFile(inputFilePath, 'utf-8');
    const seriesArray = JSON.parse(data);
  
    // Map series data to match the Series model format
    const mappedSeries = seriesArray.map((serie) => {
      // Convert last_modified (timestamp) to ISO date format for Prisma
      const prismaCompatibleDate = new Date(parseInt(serie.last_modified) * 1000).toISOString();
      
      const genreArray = serie.genre
  ?.split(/\/|&/) // Use a regex to split by '/' or '&'
  .map(genre => genre.trim()); // Trim whitespace from each genre
      return {
        name: serie.name,
        seenby: 0,
        published: prismaCompatibleDate, // Prisma-compatible date format
        serieId: serie.series_id,
        imagePath: serie.cover,
        genres: genreArray || null,
        tmdb: serie.tmdb || null,
        rating: parseFloat(serie.rating) || null,
      };
    });
    const series={
      "series":mappedSeries
    }
    // Write the transformed data to a new JSON file
    await fs.writeFile(outputFilePath, JSON.stringify(series, null, 2), 'utf-8');
    console.log('Transformed data written to mappedSeries.json');
  } catch (error) {
    console.error('Error processing series data:', error);
  }
};

// Run the transformation and write to file
transformSeriesData();
