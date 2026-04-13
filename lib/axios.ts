import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";

// Public requests (login, register, forgot-password etc.)
const axiosPublic = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Authenticated requests — interceptors added by useAxiosPrivate hook
export const axiosPrivate = axios.create({
  baseURL:         BASE_URL,
  headers:         { "Content-Type": "application/json" },
  withCredentials: true, // sends the httpOnly refreshToken cookie automatically
});

// Let the browser set the Content-Type boundary for FormData
axiosPrivate.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosPublic;