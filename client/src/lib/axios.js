import axios from "axios";
import { VITE_API_BASE_URL } from "./env.js";

const axiosInstance = axios.create({
  baseURL: VITE_API_BASE_URL,
  withCredentials: true,
});

export default axiosInstance;
