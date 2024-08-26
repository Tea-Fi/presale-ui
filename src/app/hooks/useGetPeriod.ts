import useSWR from "swr";
import { API_URL } from "../config/env";
import { ClaimPeriodParsed } from "../utils/claim";
import { api } from "../utils/api";

export const fetcher = async (url: string): Promise<ClaimPeriodParsed> => {
  const response = await api.get(url);

  if (response.status !== 200) {
    throw new Error("Something Went Wrong");
  }
  const { data } = response;

  if (typeof response.data === "string") {
    const parsedData = JSON.parse(data);

    return {
      start: new Date(parsedData.start),
      end: new Date(parsedData.end),
    };
  }
  return response.data;
};

export const useGetPeriod = () => {
  return useSWR<ClaimPeriodParsed>(`${API_URL}/claim/period`, fetcher);
};
