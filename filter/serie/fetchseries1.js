import fs from 'fs/promises';
import fetch from 'node-fetch';
import path from 'path';

const seriesEndpoint = "http://763025459169.cdn-fug.com:8080/player_api.php?username=115763054352463&password=iuadobbh3v&action=get_series";
const seriesInfoEndpoint = "http://763025459169.cdn-fug.com:8080/player_api.php?username=115763054352463&password=iuadobbh3v&action=get_series_info&series_id=";

const seriesFilePath = path.resolve('./series.json');

// Fetch series data from the API and save it to series.json
const fetchAndSaveSeries = async () => {
  try {
    const response = await fetch(seriesEndpoint);
    if (!response.ok) throw new Error(`Failed to fetch series data: ${response.statusText}`);
    const seriesData = await response.json();
    await fs.writeFile(seriesFilePath, JSON.stringify(seriesData, null, 2), 'utf-8');
    console.log('Series data saved to series.json');
  } catch (error) {
    console.error('Error fetching series data:', error);
  }
};

fetchAndSaveSeries();
