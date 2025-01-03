import fs from 'fs/promises';

async function transformSeries(jsonPath) {
  try {
    const data = JSON.parse(await fs.readFile(jsonPath, 'utf8'));
    const series = data.series;

    const uniquePairs = new Set(); // To track unique tmdb|imagePath pairs
    const tmdbSet = new Set(); // To track used tmdb values
    const imagePathSet = new Set(); // To track used imagePath values
    const ungroupedSeries = [];
    const seriesMap = new Map(); // Map to store grouped series

    for (const serie of series) {
      const tmdb = serie.tmdb?.trim();
      const imagePath = serie.imagePath?.trim();

      // If neither tmdb nor imagePath is valid, move to ungrouped
      if (!tmdb && !imagePath) {
        ungroupedSeries.push(serie);
        continue;
      }

      // Create a unique key for the tmdb|imagePath pair
      const uniqueKey = `${tmdb || ''}|${imagePath || ''}`;

      // Check for uniqueness conflicts
      if (
        (tmdb && tmdbSet.has(tmdb)) || // tmdb must be unique
        (imagePath && imagePathSet.has(imagePath)) || // imagePath must be unique
        uniquePairs.has(uniqueKey) // The combined pair must also be unique
      ) {
        // Move conflicting series to ungrouped
        ungroupedSeries.push(serie);
        continue;
      }

      // Register the unique tmdb and imagePath
      if (tmdb) tmdbSet.add(tmdb);
      if (imagePath) imagePathSet.add(imagePath);
      uniquePairs.add(uniqueKey);

      // Group series entries
      if (!seriesMap.has(uniqueKey)) {
        seriesMap.set(uniqueKey, {
          name: serie.name,
          serieId: [],
          imagePath: imagePath || '',
          rating: 1,
          tmdb: tmdb || '',
          genres: [],
          published: null,
          seenby: 0,
          type_: 'SERIE',
        });
      }

      const groupedSerie = seriesMap.get(uniqueKey);
      groupedSerie.serieId.push(serie.serieId);
      if (Array.isArray(serie.genres)) {
        groupedSerie.genres = [...new Set([...groupedSerie.genres, ...serie.genres])];
      }
      groupedSerie.rating = Math.max(groupedSerie.rating, typeof serie.rating === 'number' ? serie.rating : 1);
      if (serie.published) {
        const publishedDate = new Date(serie.published);
        if (!groupedSerie.published || new Date(groupedSerie.published) < publishedDate) {
          groupedSerie.published = publishedDate.toISOString();
        }
      }
      groupedSerie.seenby += typeof serie.seenby === 'number' ? serie.seenby : 0;
    }

    console.log(`Grouped ${seriesMap.size} series.`);

    // Validate grouped series
    const groupedSeries = Array.from(seriesMap.values());
    const validationErrors = [];
    const finalTmdbSet = new Set();
    const finalImagePathSet = new Set();

    for (const groupedSerie of groupedSeries) {
      const { tmdb, imagePath } = groupedSerie;

      if (tmdb && finalTmdbSet.has(tmdb)) {
        validationErrors.push(`Duplicate tmdb detected: ${tmdb}`);
      }
      if (imagePath && finalImagePathSet.has(imagePath)) {
        validationErrors.push(`Duplicate imagePath detected: ${imagePath}`);
      }

      if (tmdb) finalTmdbSet.add(tmdb);
      if (imagePath) finalImagePathSet.add(imagePath);
    }

    if (validationErrors.length > 0) {
      console.error('Validation errors detected:', validationErrors);
      throw new Error('Grouped series contain duplicate tmdb or imagePath values.');
    }

    console.log('Validation passed. No key constraints violated.');

    // Write grouped and ungrouped series to output files
    const groupedOutputPath = '3.json';
    await fs.writeFile(groupedOutputPath, JSON.stringify({ series: groupedSeries }, null, 2));
    console.log(`Grouped series written to ${groupedOutputPath}`);

    const ungroupedOutputPath = 'ungrouped_series.json';
    await fs.writeFile(ungroupedOutputPath, JSON.stringify({ ungrouped: ungroupedSeries }, null, 2));
    console.log(`Ungrouped series written to ${ungroupedOutputPath}`);
  } catch (error) {
    console.error('Error transforming series:', error);
  }
}

// Run the transformation
const inputFilePath = '2.json'; // Replace with your actual JSON file path
transformSeries(inputFilePath);
