import prisma from '../lib/prisma.js';
import prismaclient from '../lib/prisma.js';

export const getChannels = async (req, res) => {
  try {
    const { page = 1, limit = 20, searchTerm = '', category = '' } = req.query;

    // Convert page and limit to integers for pagination
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);

    // Define filter conditions
    const where = {
      AND: [
        searchTerm ? { name: { contains: searchTerm, mode: 'insensitive' } } : {},
        category ? { category: category } : {},
      ],
    };

    // Fetch channels with pagination and search filters
    const channels = await prismaclient.channel.findMany({
      where,
      skip: (pageInt - 1) * limitInt,
      take: limitInt,
    });

    // Get the total count for pagination calculation
    const totalChannels = await prismaclient.channel.count({ where });

    res.status(200).json({
      channels,
      totalPages: Math.ceil(totalChannels / limitInt),
      currentPage: pageInt,
      totalItems: totalChannels,
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ message: 'Failed to fetch channels' });
  }
};


// Get a channel by ID
export const getChannelById = async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await prisma.channel.findUnique({
      where: { id },
      include: {
        ports: true
      }
    });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    res.status(200).json(channel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch channel' });
  }
};


