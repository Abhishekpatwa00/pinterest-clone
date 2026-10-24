import axios from "axios";

export const apiReq = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT || "http://localhost:5173",
  withCredentials: true,
});

export default apiReq;
