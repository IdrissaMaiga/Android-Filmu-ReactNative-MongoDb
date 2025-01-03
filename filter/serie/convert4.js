import fs from 'fs/promises';

// Function to fetch data for a given series ID
async function fetchSeriesData(seriesId) {
    const apiUrl = `http://763025459169.cdn-fug.com:8080/player_api.php?username=115763054352463&password=iuadobbh3v&action=get_series_info&series_id=${seriesId}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch data for series ID ${seriesId}: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data.episodes)
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Function to process and merge episodes
function mergeEpisodes(seriesDataArray) {
    const seasons = {};

    for (const seriesData of seriesDataArray) {
        if (!seriesData || !seriesData.episodes) continue;

        for (const [seasonNumber, episodes] of Object.entries(seriesData.episodes)) {
            const seasonKey = parseInt(seasonNumber, 10);

            if (!seasons[seasonKey]) {
                seasons[seasonKey] = [];
            }

            for (const episode of episodes) {
                const episodeKey = parseInt(episode.episode_num, 10);

                let seasonEpisodeEntry = seasons[seasonKey].find(entry => entry[episodeKey]);
                if (!seasonEpisodeEntry) {
                    seasonEpisodeEntry = { [episodeKey]: [] };
                    seasons[seasonKey].push(seasonEpisodeEntry);
                }

                seasonEpisodeEntry[episodeKey].push({

                  "id": episode.id,
                  "episode_num": episode.episode_num,
                  "title": episode.title,
                  "container_extension": episode.container_extension,


                });
            }
        }
    }

    return { seasons };
}

// Main function to fetch and process all series IDs
async function processSeries(series) {
    const seriesIds = series.serieId;

    const seriesDataPromises = seriesIds.map(id => fetchSeriesData(id));
    const seriesDataArray = await Promise.all(seriesDataPromises);

    const mergedData = mergeEpisodes(seriesDataArray);

    const outputFilePath = './merged_series_data.json';
    await fs.writeFile(outputFilePath, JSON.stringify(mergedData, null, 2));

    console.log(`Merged data saved to ${outputFilePath}`);
}

// Example series input
const series = {
    "name": "Geek Girl_fr",
    "serieId": [27834, 27827, 27846, 27912, 27898],
    "imagePath": "https://image.tmdb.org/t/p/w600_and_h900_bestv2/qwyeJqZxMVHF4m8BeNa7ehwz1Mp.jpg",
    "rating": 10,
    "tmdb": "252605",
    "genres": ["Drame", "Comédie", "Familial", "Drama", "Comedy", "Family", "Comedia", "Familia", "Dram", "Komedi", "Aile"],
    "published": "2024-10-09T17:52:36.000Z",
    "seenby": 0,
    "type_": "SERIE"
};

// Run the script
processSeries(series);
