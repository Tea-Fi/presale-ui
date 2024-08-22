import { Axios } from "axios";

export const api = new Axios({
  baseURL: import.meta.env.VITE_API_URL,
});

export const fetcher = async <T>(url: string): Promise<T> => {
  const response = await api.get<T>(url);

  if (response.status !== 200) {
    throw new Error("Something Went Wrong");
  }
  return response.data;
};
