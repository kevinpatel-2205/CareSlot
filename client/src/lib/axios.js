import axios from "axios";
import { emitToast } from "./toastBus.js";
import { VITE_API_BASE_URL } from "./env.js";

const axiosInstance = axios.create({
  baseURL: VITE_API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => {
    const method = (response.config?.method || "get").toLowerCase();
    const message = response.data?.message;
    if (method !== "get" && message) {
      emitToast("success", message);
    }
    return response;
  },
  (error) => {
    const message = error?.response?.data?.message || "Something went wrong";
    emitToast("error", message);
    return Promise.reject(error);
  },
);

export default axiosInstance;
