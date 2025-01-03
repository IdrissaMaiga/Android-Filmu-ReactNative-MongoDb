import { promises as fsPromises } from 'fs';
import { existsSync, writeFileSync, appendFileSync } from 'node:fs'; // For synchronous file handling

const MAX_CONCURRENT_REQUESTS = 5; // Limit for concurrent requests
const CHECKPOINT_FILE = 'lastportcheked.json';
const OUTPUT_FILE = '4.json'; // Output file to store results

// Function to load checkpoint (or start from 0 if not present)
async function loadCheckpoint() {
    try {
        const checkpointData = await fsPromises.readFile(CHECKPOINT_FILE, 'utf-8');
        return JSON.parse(checkpointData);
    } catch (error) {
        return { channelIndex: 0, portIndex: 0 }; // Default if file doesn't exist
    }
}

// Function to save checkpoint
async function saveCheckpoint(channelIndex, portIndex) {
    const checkpoint = { channelIndex, portIndex };
    await fsPromises.writeFile(CHECKPOINT_FILE, JSON.stringify(checkpoint));
}

// Function to test if a port is accessible
async function testPort(port) {
    const url = `http://763025459169.cdn-fug.com:2082/live/115763054352463/iuadobbh3v/${port.indexer}.m3u8`;
    try {
        const response = await fetch(url, { method: 'HEAD' }); // Or use GET as needed
        return response.ok; // If accessible, return true
    } catch (error) {
        return false; // If there's an error, mark it as false
    }
}

// Function to load channels from the JSON file
async function loadChannels() {
    const data = await fsPromises.readFile('3.json', 'utf-8');
    return JSON.parse(data);
}

// Function to write updated channels incrementally to the output file
function writeToOutputFile(updatedChannels) {
    writeFileSync(OUTPUT_FILE, JSON.stringify({ channels: updatedChannels }, null, 2)); // Overwrite with formatted data
}

// Function to combine channels with the same name and remove duplicate ports
function processUniqueChannels(channels) {
    const channelMap = new Map();

    // Iterate through the list of channels
    for (const channel of channels) {
        const { name, ports, logos, category } = channel;

        if (!channelMap.has(name)) {
            // Initialize a new entry for this channel if it doesn't exist
            channelMap.set(name, {
                name: name,
                total: 0,
                category: category || 'undefined', // Ensure category is set
                logos: [...(logos || [])], // Initialize logos array
                ports: []
            });
        }

        const existingChannel = channelMap.get(name);

        // Add logos, ensuring no duplicates
        for (const logo of logos) {
            if (!existingChannel.logos.includes(logo)) {
                existingChannel.logos.push(logo);
            }
        }

        // Add ports, ensuring uniqueness based on `indexer`
        for (const port of ports) {
            if (!existingChannel.ports.some(p => p.indexer === port.indexer)) {
                existingChannel.ports.push(port);
            }
        }

        // Update the total port count for this channel
        existingChannel.total = existingChannel.ports.length;
    }

    // Return the processed channels as an array
    return Array.from(channelMap.values());
}

// Function to process channels with checkpointing and concurrent requests
async function processChannels() {
    const channels = await loadChannels();
    const { channelIndex: startChannelIndex, portIndex: startPortIndex } = await loadCheckpoint();
    const activeRequests = [];

    // Process channels starting from the checkpoint
    for (let i = startChannelIndex; i < channels.length; i++) {
        const channel = channels[i];

        // Process ports for this channel, starting from the saved checkpoint port index
        for (let j = i === startChannelIndex ? startPortIndex : 0; j < channel.ports.length; j++) {
            const port = channel.ports[j];

            const request = testPort(port).then(isAccessible => {
                port.ok = isAccessible; // Update port status
                console.log(port.name)
            });
            
            activeRequests.push(request);

            // If we hit the concurrency limit, wait for the promises to resolve
            if (activeRequests.length >= MAX_CONCURRENT_REQUESTS) {
                await Promise.all(activeRequests);
                activeRequests.length = 0; // Clear the array
            }

            // Save the checkpoint after processing the port
            await saveCheckpoint(i, j + 1);
        }

        // After processing all ports in the current channel, reset the port index in the checkpoint
        await saveCheckpoint(i + 1, 0); // Proceed to the next channel
    }

    // Ensure all active requests are completed before finishing
    await Promise.all(activeRequests);

    // Combine duplicate channels and ensure unique ports
    const updatedChannels = processUniqueChannels(channels);

    // Write final output to file
    writeToOutputFile(updatedChannels);

    console.log('Channel processing complete. Number of unique channels:', updatedChannels.length);
}

// Initial setup to ensure output file exists or is cleared
function initializeOutputFile() {
    if (existsSync(OUTPUT_FILE)) {
        writeFileSync(OUTPUT_FILE, ''); // Clear existing content
    }
}

// Run the process
initializeOutputFile(); // Clear output file or create a new one
processChannels().catch(console.error);
