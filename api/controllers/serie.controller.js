import prismaclient from '../lib/prisma.js'
import { decrypt } from '../lib/crypto.js';


export const getSeries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const genreFilter = req.query.genre || ""; // Genre to filter by
    
    // Use Prisma's `has` for filtering array fields
    const genreCondition = genreFilter
      ? { genres: { has: genreFilter } }
      : {};

    
      // Normal pagination mode
      const skip = (page - 1) * pageSize;
      const series = await prismaclient.series.findMany({
        skip,
        take: pageSize,
        where: {
          ...genreCondition, // Use Prisma's has operator
        },
        orderBy: { published: 'desc' },
        select:{tmdb:true,id:true}
      });

      const totalSeries = await prismaclient.series.count({
        where: {
          ...genreCondition,
        },
      });

     // console.log(totalSeries,"serie")
      res.status(200).json({
        items:series,
        page,
        pageSize,
        totalItem:totalSeries,
      });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch series' });
  }
};



export const getSerieById = async (req, res) => {
  try {
    const { id} = req.query;

    // Fetch series based on `tmdb` 
    let serie = await prismaclient.series.findUnique({
      where: {
       
       id
       
      }
    });

    if (!serie ) {
      return res.status(404).json({ message: 'Serie not found' });
    }

    let { serieId, ...rest } = serie;

    // Map through the serieId array and decrypt each ID
    const decryptedSerieIds = serieId.map(id => decrypt(id));
    
    // Log the decrypted serieId array
    //console.log(decryptedSerieIds);
    
    // Rebuild the serie object with the updated serieId
    serie = { ...rest, serieId: decryptedSerieIds };
    
    // Send the result to Prisma or any further processing
    // Prisma code to send the result (for example)
    
    // Send the result, Prisma ensures no duplicates due to unique constraints
    res.status(200).json(serie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch series' });
  }
};


export const getMoviesAndSeries = async (req, res) => {
  try {
    // Extract query parameters with defaults
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const searchFilter = req.query.search?.trim().toLowerCase() || ""; // Convert search keyword to lowercase
    const type = req.query.type?.toLowerCase() || "all"; // Convert type to lowercase

    // Search condition for filtering by genre or name (case-insensitive)
    const searchCondition = searchFilter
      ? {
          OR: [
            { genres: { has: searchFilter } }, // Match genre in the genre array
            { name: { contains: searchFilter, mode: "insensitive" } }, // Match name case-insensitively
          ],
        }
      : {};

    // Calculate pagination offset
    const skip = (page - 1) * pageSize;

    // Asynchronously fetch movies and series based on type
    const [movies, series] = await Promise.all([
      (type === "all" || type === "movie") &&
        prismaclient.movie.findMany({
          skip,
          take: pageSize,
          where: searchCondition,
          orderBy: { added: "desc" }, // Order by recently added
          select: { tmdb: true, id: true }, // Select relevant fields
        }),

      (type === "all" || type === "serie") &&
        prismaclient.series.findMany({
          skip,
          take: pageSize,
          where: searchCondition,
          orderBy: { published: "desc" }, // Order by recently published
          select: { tmdb: true, id: true }, // Select relevant fields
        }),
    ]);

    // Fetch total counts for pagination
    const [totalMovies, totalSeries] = await Promise.all([
      (type === "all" || type === "movie") &&
        prismaclient.movie.count({ where: searchCondition }),
      (type === "all" || type === "serie") &&
        prismaclient.series.count({ where: searchCondition }),
    ]);

    // Combine results into a unified list if "all" is selected
    const combinedItems =
      type === "all"
        ? [...(movies || []), ...(series || [])]
        : type === "movie"
        ? movies
        : series;

    // Calculate the total number of items
    const totalItem = (totalMovies || 0) + (totalSeries || 0);

    // Respond with the fetched data
    res.status(200).json({
      success: true,
      items: combinedItems,
      page,
      pageSize,
      totalItem,
      totalMovies: totalMovies || 0,
      totalSeries: totalSeries || 0,
    });
  } catch (error) {
    console.error("Error fetching movies and series:", error);
    res.status(500).json({ success: false, message: "Failed to fetch movies and series" });
  }
};
