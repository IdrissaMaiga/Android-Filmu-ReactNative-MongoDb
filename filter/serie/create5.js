import { encrypt } from "../../api/lib/crypto.js"; // Assumes you have an encrypt function defined
import fs from "fs/promises";
import prismaclient from "../../api/lib/prisma.js"; // Prisma client instance

// Encrypts an array of IDs
const encryptSerieIds = (serieIds) => serieIds.map((id) => encrypt(id.toString()));

// Main function to handle the insertion of all series
const insertSeries = async (jsonPath) => {
  try {
    const { series } = JSON.parse(await fs.readFile(jsonPath, "utf8"));

    if (!Array.isArray(series) || series.length === 0) {
      throw new Error("No series found in the JSON file.");
    }

    // Prepare series data for bulk insertion
    const seriesData = series.map((serie) => ({
      name: serie.name,
      type_: serie.type_ || "SERIE",
      seenby: serie.seenby || 0,
      imagePath: serie.imagePath,
      tmdb: serie.tmdb,
      serieId: encryptSerieIds(serie.serieId),
      rating: serie.rating || 1,
      genres: serie.genres || [],
      published: serie.published ? new Date(serie.published) : null,
    }));

    // Bulk insert series into the database
    const result = await prismaclient.series.createMany({
      data: seriesData,
      
    });

    console.log(`${result.count} series have been inserted successfully!`);
  } catch (error) {
    console.error("Error inserting series:", error);
  }
};

// Run the function
insertSeries("3.json"); // Path to your JSON file
