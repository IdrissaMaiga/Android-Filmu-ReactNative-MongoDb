import prismaclient from '../lib/prisma.js';
import { decrypt } from '../lib/crypto.js';


export const getMovies = async (req, res) => {
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
      const movies = await prismaclient.movie.findMany({
        skip,
        take: pageSize,
        where: genreCondition,
        orderBy: { added: 'desc' },
        select:{tmdb:true,id:true}
      });

      // Fetch the total number of movies
      const totalMovies = await prismaclient.movie.count({
        where: genreCondition,
      });
      //console.log("movie",totalMovies)
      res.status(200).json({
        items:movies,
        page,
        pageSize,
        totalItem:totalMovies,
      });
     
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch movies' });
  }
};



export const getMovieById = async (req, res) => {
  try {
    const { id
     } = req.query;

    // Fetch the movie by `tmdb` field
    const movie = await prismaclient.movie.findUnique({
      where: { id },
    });

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Decrypt the `indexer` field if it exists
    const movieWithDecryptedIndexer = {
      ...movie,
      indexer: movie.indexer ? movie.indexer.map(decrypt) : [], // Decrypt only if indexer exists
    };

    res.status(200).json(movieWithDecryptedIndexer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch movie' });
  }
};
