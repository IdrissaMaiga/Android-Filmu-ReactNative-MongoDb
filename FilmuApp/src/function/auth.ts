import { AxiosError } from 'axios';
import { handleError, handleSuccess } from './handleError';
import { api } from './server';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage pour React Native
import DeviceInfo from 'react-native-device-info';
import { APIResponse } from "./handleError";

export interface DeviceInfoDetails {
  deviceType: string;
  os: string;
  ipAddress: string;
}

/**
 * Récupère les informations sur l'appareil, y compris le type d'appareil, le système d'exploitation et l'adresse IP publique.
 * @returns {Promise<DeviceInfoDetails>} Les informations sur l'appareil.
 */
export const getDeviceInfo = async (): Promise<DeviceInfoDetails> => {
  // Obtenir le type d'appareil et le nom du système d'exploitation
  const deviceType = DeviceInfo.getDeviceType();
  const osName = DeviceInfo.getSystemName() || "Inconnu"; // Valeur par défaut si null

  // Récupérer l'adresse IP publique
  let ipAddress = "0.0.0.0"; // Adresse IP par défaut
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    ipAddress = data.ip || "0.0.0.0"; // Valeur par défaut si null
  } catch (error) {
    console.error("Erreur lors de la récupération de l'adresse IP :", error);
  }

  return {
    deviceType: deviceType.charAt(0).toUpperCase() + deviceType.slice(1), // Mettre la première lettre en majuscule
    os: osName,
    ipAddress,
  };
};

// Fonctions liées à l'utilisateur

/**
 * Récupère les informations de l'utilisateur.
 * @returns {Promise<APIResponse>} Réponse API avec les détails de l'utilisateur.
 */
export const fetchUser = async (): Promise<APIResponse> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await api.get('/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data?.exit) {
      await AsyncStorage.removeItem('accessToken');
    }

    return handleSuccess('Utilisateur récupéré avec succès', response.data);
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

/**
 * Authentifie l'utilisateur et sauvegarde le jeton d'accès.
 * @param {Record<string, any>} data Les informations de connexion.
 * @returns {Promise<APIResponse>} Réponse API après connexion.
 */
export const login = async (data: Record<string, any>): Promise<APIResponse> => {
  try {
    const deviceInfo = await getDeviceInfo();
    
    const response = await api.post('/api/auth/login', { ...data, deviceInfo });
    console.log(response);
    if (response.data?.accessToken) {
      await AsyncStorage.setItem('accessToken', response.data.accessToken);
    }

    return handleSuccess('Connexion réussie', response.data);
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

/**
 * Déconnecte l'utilisateur et supprime le jeton d'accès.
 * @returns {Promise<APIResponse>} Réponse API après déconnexion.
 */
export const logout = async (): Promise<APIResponse> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    await api.get('/api/auth/logout', { headers: { Authorization: `Bearer ${token}` } });
    await AsyncStorage.removeItem('accessToken');
    return handleSuccess('Déconnexion réussie', true);
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

/**
 * collect l'utilisateur 
 * @returns {Promise<APIResponse>} Réponse API après déconnexion.
 */
export const getProfil = async (): Promise<APIResponse> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
   const res= await api.get('/api/user/profile', { headers: { Authorization: `Bearer ${token}` } });
    return handleSuccess('Utilisateur obtenu', res.data);
  } catch (error) {
    return handleError(error as AxiosError);
  }
};


''
/**
 * Met à jour un champ spécifique du profil de l'utilisateur.
 * @param {Record<string, any>} data Les données à mettre à jour.
 * @returns {Promise<APIResponse>} Réponse API après mise à jour.
 */
export const updateField = async (data: Record<string, any>): Promise<APIResponse> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await api.put('/api/user/profile/updateField', data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return handleSuccess('Champ mis à jour avec succès', response.data.user);
  } catch (error) {
    return handleError(error as AxiosError);
  }
};
export const flagDevice = async ({ deviceId }: { deviceId: string }): Promise<APIResponse> => {
  try {
    // Retrieve the token from AsyncStorage
    const token = await AsyncStorage.getItem('accessToken');
    
    // If there's no token, you may want to handle that case
    if (!token) { 
      throw new Error('No access token found');
     
    }

    // Send the PATCH request to flag the device
    const response = await api.patch('/api/user/flag', { deviceId }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Assuming handleSuccess is defined elsewhere to format the successful response
    return handleSuccess('Appareil declarer', response.data);
  } catch (error) {
    // Assuming handleError is defined elsewhere to handle error responses
    return handleError(error as AxiosError);
  }
};
