import axios, { AxiosInstance } from 'axios';

// Define the base URL type as a string
export const baseurl: string = "https://server1.filmutunnel.site"//'http://10.0.2.2:3000';  ///"https://server1.filmutunnel.site" //'http://localhost:3000'
export const streamingserverurl = 'http://763025459169.cdn-fug.com:2082' // Ensure this matches your backend
// Create a typed Axios instance
export const api: AxiosInstance = axios.create({
  baseURL: baseurl, // Ensure this matches your backend
  // withCredentials: true,  // Uncomment if you need to send credentials like cookies
});


