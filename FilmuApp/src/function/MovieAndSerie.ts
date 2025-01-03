import { AxiosError } from 'axios';
import { APIResponse, handleError, handleSuccess } from './handleError';
import { api, streamingserverurl, baseurl } from './server';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// TMDB API Key
const apiKey = '91f480a74749344a6e1b15f5ead2cb12';

// Base URL for TMDB API
const baseUrl = 'https://api.themoviedb.org/3';

// Endpoint for series information
const serieiInfoEndpoint = '/player_api.php?username=115763054352463&password=iuadobbh3v&action=get_series_info&series_id=';

// Define an interface for the expected response data.
interface DetailsResponse {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  rating: number;
  backdrop_path?: string | null;
  seasons?: Array<Season> | null;
  genres?: Array<Genre> | null;
  tagline?: string | null;
}


export interface Movie {
  id: string;
  creationdate: Date;
  name: string;
  indexer: string[];
  imagePath: string;
  isAdult: boolean;
  extension: string[];
  tmdb: string;
  added?: Date;
  genres: string[];
  rating?: number;
  type_: string;
  seenby: number;
}
export interface Season {
  id: number;
  air_date: string;
  episode_count: number;
  name: string;
  overview: string;
  poster_path?: string;
  season_number: number;
  vote_average?: number;
  vote_count?: number;
  episodes?: Episode[];
}

export 
interface Genre {
  id: number;
  name: string;
}

export interface Serie {
  backdrop_path: string;
  name: string;
  overview: string;
  vote_average: number;
  seasons: Array<Season>;
  genres: Array<Genre>;
  tagline?: string;
}
export interface Episode {
  id: number;
  name: string;
}

// Interface for API request parameters
interface FetchMoviesAndSeriesParams {
  page: number;
  pageSize: number;
  search?: string;
  type?: string;
}

// Interface for Episode details parameters
interface FetchEpisodeDetailsParams {
  seriesId: string;
  seasonNumber: number;
  episodeNumber: number;
}

/**
 * Fetches genres for movies or series.
 * @param type - The content type ("movie" or "series").
 * @returns Promise containing genres.
 */
export const fetchGenre = async (type: "movie" | "serie"): Promise<any> => {
  const searchType = type === "movie" ? "movie" : "tv";
  const url = `${baseUrl}/genre/${searchType}/list?api_key=${apiKey}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    //console.error("Error fetching details:", error);
    return null;
  }
};


  
export const fetchDetails = async (tmdbId: string, type: string): Promise<DetailsResponse | null> => {
    
    const searchType = type === "movie" ? "movie" : "tv" ;
    if (!searchType) {
      console.error(`Invalid type "${type}" provided. Expected "movie" or "serie".`);
      return null;
    }
  
    const url = `${baseUrl}/${searchType}/${tmdbId}?api_key=${apiKey}&language=fr-FR`;
   
  
    try {
      const response = await axios.get(url);
      
      return response.data as DetailsResponse;
    } catch (error: any) {
      //console.error("Error fetching details:", error.response || error.message || error);
      return null;
    }
  };
  

/**
 * Fetches information of a series.
 * @param serieId - The ID of the series.
 * @returns Promise containing series information.
 */
export const getSerieInfo = async (serieId: string): Promise<APIResponse> => {
  try {
    const response = await axios.get(`${streamingserverurl}${serieiInfoEndpoint}${serieId}`);
    return handleSuccess('Fetched series info', response.data);
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

/**
 * Fetches movies or series based on criteria.
 * @param page - The page number.
 * @param pageSize - The size of the page.
 * @param type - The content type ("movie" or "series").
 * @param genre - (Optional) The genre to filter content.
 * @returns Promise containing fetched movies or series.
 */
export const fetchMoviesOrSeries = async (
  page: number,
  pageSize = 24,
  type: string,
  genre?: any
): Promise<APIResponse> => {
  try {
    const genreToPass:string= genre==='All'?"":genre
    const token = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${baseurl}/api/${type}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, pageSize, genre:genreToPass },
    });
    return handleSuccess(`Fetched ${type}`, response.data);
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

/**
 * Fetches movies and series based on search parameters.
 * @param params - Parameters for fetching content.
 * @returns Promise containing fetched movies and series.
 */
export const fetchMoviesAndSeries = async (params: FetchMoviesAndSeriesParams): Promise<APIResponse> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${baseurl}/api/searchmovieandserie`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return handleSuccess('Fetched all movies and series', response.data);
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

/**
 * Fetches details of an episode.
 * @param params - Parameters for fetching episode details.
 * @returns Promise containing episode details.
 */
export const fetchEpisodeDetails = async (params: FetchEpisodeDetailsParams): Promise<APIResponse> => {
  try {
    const { seriesId, seasonNumber, episodeNumber } = params;
    const url = `${baseUrl}/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${apiKey}&language=fr-FR`;
    const response = await axios.get(url);
    return handleSuccess('Fetched episode details', response.data);
  } catch (error) {
    return handleError(error as AxiosError);
  }
};




/**
 * Checks if a movie or series is in the user's taste list.
 * @param id - The ID of the movie or series.
 * @param type - The content type ("movie" or "series").
 * @returns Promise indicating if the content is in the user's taste list.
 */
export const getItem = async (id: string, type: string): Promise<APIResponse> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await api.get(`/api/${type}/byid`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { id},
    });
    return handleSuccess('Checked taste', response.data);
  } catch (error) {
    return handleError(error as AxiosError);
  }
};




// TypeScript type definitions



interface User {
  username: string;
  password: string;
}

interface EpisodeData {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
}

interface SeriesData {
  episodes: { [season: string]: EpisodeData[] };
}

export interface Items {
  [season: number]: { [episode_num: number]: EpisodeData[] }[];
}

// Function to fetch data for a given series ID
async function fetchSeriesData(seriesId: string, user: User): Promise<SeriesData | null> {
  const apiUrl = `${streamingserverurl}/player_api.php?username=${user.username}&password=${user.password}&action=get_series_info&series_id=${seriesId}`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for series ID ${seriesId}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Function to process and merge episodes
function mergeEpisodes(seriesDataArray: (SeriesData | null)[]): { seasons: Record<number, { [episodeNum: number]: EpisodeData[] }[]> } {
  const seasons: Record<number, { [episodeNum: number]: EpisodeData[] }[]> = {};

  for (const seriesData of seriesDataArray) {
    if (!seriesData || !seriesData.episodes) continue;

    for (const [seasonNumber, episodes] of Object.entries(seriesData.episodes)) {
      const seasonKey = parseInt(seasonNumber, 10);

      if (!seasons[seasonKey]) {
        seasons[seasonKey] = [];
      }

      for (const episode of episodes) {
        const episodeKey = episode.episode_num;

        let seasonEpisodeEntry = seasons[seasonKey].find(entry => entry[episodeKey]);
        if (!seasonEpisodeEntry) {
          seasonEpisodeEntry = { [episodeKey]: [] };
          seasons[seasonKey].push(seasonEpisodeEntry);
        }

        seasonEpisodeEntry[episodeKey].push({
          id: episode.id,
          episode_num: episode.episode_num,
          title: episode.title,
          container_extension: episode.container_extension,
        });
      }
    }
  }

  return { seasons };
}

// Main function to fetch and process all series IDs
export async function processSerieData(seriesIds: string[], user: User) {
  const seriesDataPromises = seriesIds.map(id => fetchSeriesData(id, user));
  const seriesDataArray = await Promise.all(seriesDataPromises);
  const mergedData = mergeEpisodes(seriesDataArray);

  //console.log(mergedData);
  
  return mergedData.seasons;
}