import { createCanvas, loadImage } from 'canvas'; 
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import pLimit from 'p-limit';
import cliProgress from 'cli-progress';

const cacheDir = 'imgs'; // Change cache directory to imgs
const channelsFile = 'channels.json'; // File to store channel data
const MAX_CONCURRENT_REQUESTS = 10; // Higher concurrency for faster fetching

// Ensure the cache directory exists
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
}

// Helper to fetch images with retries
async function fetchWithRetry(url) {
    for (let attempt = 1; attempt <= 2; attempt++) { // Retry up to 2 times
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch: ${url} with status ${response.status}`);
            return await response.buffer();
        } catch (error) {
            console.error(`Attempt ${attempt} failed for ${url}: ${error.message}`);
            if (attempt === 2) throw new Error(`All fetch attempts failed for ${url}`);
        }
    }
}

// Get image cache path by channel number
function getImageCachePath(channelNumber) {
    return path.join(cacheDir, `${channelNumber}.png`);
}

// Fetch and cache image
async function fetchImage(url, channelNumber) {
    const cachePath = getImageCachePath(channelNumber);
    if (fs.existsSync(cachePath)) {
        console.log(`Image already cached: ${cachePath}`);
        return cachePath; // Return the cached image path if it exists
    }

    try {
        const buffer = await fetchWithRetry(url);
        fs.writeFileSync(cachePath, buffer); // Save to disk cache
        console.log(`Fetched and cached image: ${cachePath}`);
        return cachePath; // Return the newly cached image path
    } catch (error) {
        console.error(`Failed to fetch and cache image from ${url}: ${error.message}`);
    }
}

// Main function to fetch images from channels
async function fetchImages(channels) {
    const limit = pLimit(MAX_CONCURRENT_REQUESTS);
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(channels.length, 0);

    const promises = channels.map(async (channel) => {
        const imgUrl = channel.stream_icon; // Assuming each channel has a stream_icon URL
        const cachedImagePath = await limit(() => fetchImage(imgUrl, channel.num)); // Use channel number for image naming
        return { ...channel, cachedImagePath }; // Return channel data along with cached image path
    });
    
    const cachedChannels = await Promise.all(promises);
    progressBar.stop();

    // Save channels to a JSON file
    fs.writeFileSync(channelsFile, JSON.stringify(cachedChannels, null, 2));
    console.log(`Channels and cached images saved to ${channelsFile}`);
}

// Example usage
(async () => {
    try {
        const response = await fetch('http://763025459169.cdn-fug.com:8080/player_api.php?username=115763054352463&password=iuadobbh3v&action=get_live_streams');
        if (!response.ok) throw new Error(`Failed to fetch channels: ${response.status}`);
        
        const channels = await response.json();
        await fetchImages(channels);
        console.log('All images fetched and cached.');
    } catch (error) {
        console.error('Error fetching images:', error.message);
    }
})();
