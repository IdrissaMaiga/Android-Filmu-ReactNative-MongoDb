import { createCanvas, loadImage } from 'canvas';
import fs from 'fs/promises';
import path from 'path';
import pLimit from 'p-limit';
import { imageHash } from 'image-hash';

const cacheDir = 'imgs';
const channelsFile = 'channels.json';
const MAX_CONCURRENT_REQUESTS = 200; // Increase concurrency
const similarityThreshold = 70; // Similarity threshold for hashing
const colorSimilarityThreshold = 0.9; // Color similarity threshold (1 is identical, 0 is different)
const checkpointFile = '2.json'; // Checkpoint file to save progress

// Cache for image hashes and histograms
const hashCache = new Map();
const histogramCache = new Map();
// Cache for image existence checks
const fileExistenceCache = new Map();
// Set of unsupported channels to skip
const unsupportedChannels = new Set();

// Get image path by channel number
function getImagePath(channelNumber) {
    return path.join(cacheDir, `${channelNumber}.png`);
}

// Preload file existence information to avoid checking multiple times
async function preloadFileExistence(channels) {
    const promises = channels.map(async (channel) => {
        const imgPath = getImagePath(channel.num);
        try {
            await fs.access(imgPath); // Check if file exists
            fileExistenceCache.set(channel.num, true); // Cache existence
        } catch {
            fileExistenceCache.set(channel.num, false); // Cache missing file
        }
    });
    await Promise.all(promises);
    console.log('File existence preloading complete.');
}

// Compute perceptual hash of an image
async function computePerceptualHash(imgPath) {
    if (hashCache.has(imgPath)) {
        return hashCache.get(imgPath); // Return cached hash
    }
    
    const img = await loadImage(imgPath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const buffer = canvas.toBuffer();

    return new Promise((resolve, reject) => {
        imageHash({ data: buffer }, 32, true, (error, hash) => {
            if (error) reject(error);
            hashCache.set(imgPath, hash); // Cache the computed hash
            resolve(hash);
        });
    });
}

// Function to get color histogram
async function getColorHistogram(channelNumber) {
    if (histogramCache.has(channelNumber)) {
        return histogramCache.get(channelNumber); // Return cached histogram
    }
    
    const imgPath = getImagePath(channelNumber);
    const img = await loadImage(imgPath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    const histogram = {};
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const color = `${r},${g},${b}`;
        histogram[color] = (histogram[color] || 0) + 1;
    }

    histogramCache.set(channelNumber, histogram); // Cache the result
    return histogram;
}

// Validate if the image is supported before computing the hash
async function isImageSupported(channelNumber) {
    const imgPath = getImagePath(channelNumber);
    try {
        await loadImage(imgPath);
        return true; // Supported
    } catch (error) {
        unsupportedChannels.add(channelNumber); // Mark as unsupported
        console.warn(`Unsupported image type for channel ${channelNumber}: ${error.message}`);
        return false; // Unsupported
    }
}

// Check if two images are similar based on their perceptual hashes
async function areImagesSimilar(channelNumber1, channelNumber2) {
    try {
        const [hash1, hash2] = await Promise.all([
            computePerceptualHash(getImagePath(channelNumber1)),
            computePerceptualHash(getImagePath(channelNumber2)),
        ]);

        const similarity = calculateSimilarity(hash1, hash2);
        if (similarity >= similarityThreshold) {
            const [histogram1, histogram2] = await Promise.all([
                getColorHistogram(channelNumber1),
                getColorHistogram(channelNumber2),
            ]);
            const colorSimilarity = compareHistograms(histogram1, histogram2);
            return colorSimilarity >= colorSimilarityThreshold; // Both hash and color must match
        }

        return false; // Not similar if perceptual hash fails
    } catch (error) {
        console.error(`Error comparing images for channel ${channelNumber1} and ${channelNumber2}: ${error.message}`);
        return false;
    }
}

// Calculate similarity between two hashes (Hamming distance)
function calculateSimilarity(hash1, hash2) {
    let differences = 0;
    for (let i = 0; i < Math.max(hash1.length, hash2.length); i++) {
        if (hash1[i] !== hash2[i]) {
            differences++;
        }
    }
    const maxLength = Math.max(hash1.length, hash2.length);
    const similarityPercentage = ((maxLength - differences) / maxLength) * 100;
    return similarityPercentage;
}

// Compare two color histograms
function compareHistograms(histogram1, histogram2) {
    let totalColors = 0;
    let totalSimilar = 0;

    for (const color in histogram1) {
        if (histogram2[color]) {
            totalSimilar += Math.min(histogram1[color], histogram2[color]);
        }
        totalColors += histogram1[color]; // Count total for normalization
    }

    return totalSimilar / totalColors; // Value between 0 (no match) and 1 (perfect match)
}



// Save the progress to a checkpoint file
async function saveCheckpoint(groups, currentIndex) {
    await fs.writeFile(checkpointFile, JSON.stringify({ groups, currentIndex }, null, 2));
    console.log(`Checkpoint saved at index ${currentIndex}`);
}

// Load the checkpoint from the file
async function loadCheckpoint() {
    try {
        const data = await fs.readFile(checkpointFile, 'utf8');
        return JSON.parse(data);
    } catch {
        return { groups: [], currentIndex: 0 }; // If no checkpoint exists, start from scratch
    }
}


// Main function to process and compare images
async function processImages(channels) {
    const limit = pLimit(MAX_CONCURRENT_REQUESTS);
    const { groups, currentIndex } = await loadCheckpoint();

    // Preload file existence information
    await preloadFileExistence(channels);

    // Create an array of valid channels
    const validChannels = channels.filter(channel => 
        fileExistenceCache.get(channel.num) && 
        !unsupportedChannels.has(channel.num)
    );

    for (let i = currentIndex; i < validChannels.length; i++) {
        const channel = validChannels[i];
        const channelNumber = channel.num;

        console.log(`Processing image: ${channelNumber}`);

        // Check if image is supported
        const isSupported = await isImageSupported(channelNumber);
        if (!isSupported) {
            console.warn(`Skipping unsupported channel: ${channelNumber}`);
            // Remove unsupported from valid channels
            validChannels.splice(i, 1);
            i--; // Adjust index due to removal
            continue; // Skip unsupported image types
        }

        let foundGroup = false;
        let currentGroup = [channel];

        for (let group of groups) {
            const groupChannelNumber = group[0].num;

            try {
                const isSimilar = await limit(() =>
                    areImagesSimilar(channelNumber, groupChannelNumber)
                );

                if (isSimilar) {
                    group.push(channel);
                    foundGroup = true;
                    console.log(`Grouped channel ${channelNumber} with channel ${groupChannelNumber}`);
                    break;
                }
            } catch (error) {
                console.error(`Error comparing images for channel ${channelNumber} and ${groupChannelNumber}: ${error.message}`);
            }
        }

        if (!foundGroup) {
            groups.push(currentGroup);
            console.log(`Created new group for channel ${channelNumber}`);
        }

        // Save progress every 10 channels
        if (i % 10 === 0) {
            await saveCheckpoint(groups, i);
        }
    }

    
   
    console.log('All images processed.');
}

// Example usage
(async () => {
    try {
        const channelsData = await fs.readFile(channelsFile, 'utf8');
        const channels = JSON.parse(channelsData);
        await processImages(channels);
        console.log('All images processed.');
    } catch (error) {
        console.error('Error processing images:', error.message);
    }
})();
