import { Axios } from "axios";

export const api = new Axios({
  baseURL: import.meta.env.VITE_API_URL,
});

export const fetcher = async <T>(url: string): Promise<T> => {
  const response = await api.get(url);

  if (response.status !== 200) {
    throw new Error("Something Went Wrong");
  }

  if (typeof response.data === "string") {
    return JSON.parse(response.data) as T;
  }

  return response.data;
};
