import { Axios } from "axios";

export const api = new Axios({
  baseURL: import.meta.env.VITE_API_URL,
});

export const fetcher = async <T>(url: string): Promise<T> => {
  const response = await api.get(url);
  return response.data;
};
