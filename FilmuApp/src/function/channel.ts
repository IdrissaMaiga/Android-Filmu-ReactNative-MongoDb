import { AxiosError } from 'axios';
import { handleError, handleSuccess } from './handleError';
import { api} from './server';
import AsyncStorage from '@react-native-async-storage/async-storage'; // React Native's AsyncStorage
import { APIResponse } from './handleError';

// Fetch channel details
export const fetchChannelDetails = async (id: string): Promise<APIResponse> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await api.get(`/api/channels/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(response.data)
    return handleSuccess('Fetched channel details', response.data);
    
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

// Fetch port and play details
export const fetchPortAndPlay = async (
  portId: string,
  user: { username: string; password: string } 
): Promise<APIResponse> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const portResponse = await api.get(`/api/port/${portId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const port = portResponse.data;
 
 
   console.log(port,user)
    // program API

    if (port) {
      const epgResponse = await api.get('', {
        baseURL: 'http://763025459169.cdn-fug.com:2082/player_api.php', // Replace with actual EPG API base URL
        params: {
          username: user.username,
          password: user.password,
          action: 'get_short_epg',
          stream_id: port.indexer,
        },
      });

      return handleSuccess('Fetched port and EPG details', {
        port,
        epg: epgResponse.data.epg_listings || [],
      });
    }

    return handleError(
      new AxiosError('User streaming access or port not found')
    );
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

// Fetch all channels
export const fetchChannels = async (
  currentPage: number,
  ITEMS_PER_PAGE: number,
  searchTerm: string,
  selectedCategory: string
): Promise<APIResponse> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await api.get('/api/channels', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        searchTerm,
        category: selectedCategory,
      },
    });

    return handleSuccess('Fetched channels', {
      channels: response.data.channels,
      totalPages: response.data.totalPages,
    });
  } catch (error) {
    return handleError(error as AxiosError);
  }
};
