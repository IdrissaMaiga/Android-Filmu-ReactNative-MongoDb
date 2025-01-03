import  { AxiosError } from 'axios';
import { handleError, handleSuccess } from './handleError';
import { api } from './server';
import AsyncStorage from '@react-native-async-storage/async-storage'; // React Native's AsyncStorage
import {APIResponse} from "./handleError"


export const getAgents = async (): Promise<APIResponse> => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res =await api.get('/api/agents', { headers: { Authorization: `Bearer ${token}` } });
      await AsyncStorage.removeItem('accessToken');
      return handleSuccess('Fetched Agent', res.data);
    } catch (error) {
      return handleError(error as AxiosError);
    }
  };