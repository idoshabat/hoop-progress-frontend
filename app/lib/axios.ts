
import axios from "axios";

const api = axios.create({
  baseURL: "https://13.62.225.140/api/",
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
