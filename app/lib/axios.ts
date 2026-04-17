
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  // baseURL: "https://hoopprogress.duckdns.org/api/",
  withCredentials: true,
});

export const setAccessToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export default api;
