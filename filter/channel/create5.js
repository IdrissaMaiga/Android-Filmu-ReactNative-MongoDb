import { encrypt } from "../../api/lib/crypto.js";
import fs from "fs/promises";
import prismaclient from "../../api/lib/prisma.js";
import { ObjectId } from "bson"; // Import ObjectId for generating valid MongoDB IDs

const createChannelsFromLocalFile = async () => {
  try {
    const filePath = "./4.json"; // Adjust path as necessary

    // Load and parse JSON file
    const fileContent = await fs.readFile(filePath, "utf-8");
    const { channels } = JSON.parse(fileContent);

    if (!channels || !Array.isArray(channels)) {
      throw new Error("Invalid JSON structure: 'channels' should be an array.");
    }

    // Prepare data for bulk creation
    const channelData = [];
    const portData = [];

    for (const channel of channels) {
      const channelId = new ObjectId(); // Generate a valid MongoDB ObjectId for the channel
      const { ports, ...channelDetails } = channel;

      if (!ports || !Array.isArray(ports)) {
        throw new Error(`Invalid structure for channel: ${channel.name || "Unknown"}. 'ports' should be an array.`);
      }

      channelData.push({
        id: channelId,
        ...channelDetails,
      });

      ports.forEach(port => {
        portData.push({
          id: new ObjectId(), // Generate a valid ObjectId for the port
          channelId: channelId.toString(), // Link port to channel using its ObjectId
          ...port,
          indexer: encrypt(port.indexer),
        });
      });
    }

    // Bulk create channels
    const createdChannels = await prismaclient.channel.createMany({
      data: channelData,
      
    });

    // Bulk create ports
    const createdPorts = await prismaclient.port.createMany({
      data: portData,
   
    });

    console.log("Channels created successfully:", createdChannels.count);
    console.log("Ports created successfully:", createdPorts.count);
  } catch (error) {
    console.error("Error creating channels and ports:", error.message);
    throw error;
  }
};

(async () => {
  try {
    await createChannelsFromLocalFile();
  } catch (error) {
    console.error("Failed to complete operation:", error.message);
  }
})();
