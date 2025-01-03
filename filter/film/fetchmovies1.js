import axios from 'axios';
import fs from 'fs/promises';

const fetchAndSaveJson = async () => {
  const url = 'http://763025459169.cdn-fug.com:8080/player_api.php?username=115763054352463&password=iuadobbh3v&action=get_vod_streams';

  try {
    // Fetch data from the URL
    const response = await axios.get(url);

    // Ensure response contains data
    if (response.data) {
      // Save JSON data to a file
      await fs.writeFile('vod_streams.json', JSON.stringify(response.data, null, 2), 'utf-8');
      console.log('JSON data saved to vod_streams.json');
    }
  } catch (error) {
    console.error('Error fetching or saving JSON:', error.message);
  }
};

fetchAndSaveJson();
