import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants";

/**
 * Shared Axios instance used by ALL future services.
 * - Sets baseURL from constants (handles Android/iOS difference)
 * - Injects Authorization header from AsyncStorage on every request
 *
 * auth.Service.ts still uses raw axios (existing stable code — not modified).
 * All NEW services (conversation, message, user) import this client.
 */
const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
