import { API_URL } from "../config/env";

import { api } from "./api";
import { Referral } from "./constants";

export type { Referral } from "./constants";

export interface CreateReferralPayload {
  walletAddress: string;
  referralCode: string;
  fee: number;
}

export type CreateReferralFullPayload = CreateReferralPayload & {
  signature: string;
  senderAddress: string;
};

export const validCode = async (code: string): Promise<boolean> => {
  try {
    const lead = await api
      .get(`${API_URL}/leads?code=${code}`)
      .then((res) => res.data);

    return lead;
  } catch (err) {
    return false;
  }
};

export const referralCodeExists = async (code: string): Promise<boolean> => {
  try {
    const lead = await api.get(`${API_URL}/leads?code=${code}`);

    return lead.status === 200;
  } catch (err) {
    return false;
  }
};

export const createReferral = async (
  code: string,
  payload: CreateReferralFullPayload,
) => {
  const body = JSON.stringify(payload);

  const response = await api.post(`${API_URL}/leads/${code}`, body, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    throw new Error("You are unauthorized to create new referral");
  }

  const result =
    typeof response.data === "string"
      ? JSON.parse(response.data)
      : response.data;

  if (result.error) {
    throw new Error(result.message);
  }

  return result as Referral;
};

export const generateSignature = async (
  address: string,
  payload: CreateReferralPayload,
) => {
  const utf8 = new TextEncoder().encode(
    `${payload.walletAddress}${payload.referralCode}${payload.fee}`,
  );

  const buffer = await crypto.subtle.digest("SHA-256", utf8);
  const hash = Buffer.from(buffer).toString("base64");

  return `${address}${hash}`;
};

const getReferralTree = async (
  query: string,
): Promise<Referral | undefined> => {
  try {
    const response = await api.get(`${API_URL}/leads/tree?${query}`);

    if (response.status !== 200) {
      throw new Error("Code not found");
    }

    const result =
      typeof response.data === "string"
        ? JSON.parse(response.data)
        : response.data;

    return result;
  } catch (err) {
    return;
  }
};

export const getReferralTreeByCode = async (
  code: string,
  chainId: number = 1,
) => {
  return getReferralTree(`code=${code}&chainId=${chainId}`);
};

export const getReferralTreeByWallet = async (
  wallet: string,
  chainId: number = 1,
) => {
  return getReferralTree(`walletAddress=${wallet}&chainId=${chainId}`);
};

export const getReferralTreeById = async (
  id: number | string,
  chainId: number = 1,
) => {
  return getReferralTree(`id=${id}&chainId=${chainId}`);
};
