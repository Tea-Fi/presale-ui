import { API_URL } from "../config/env";

export interface CreateClaimDto {
  walletAddress: string;
  chainId: string;

  claims: ClaimAmount[];
}

export interface ClaimAmount {
  token: string;
  tokenAddress: string;

  amount: string;
  amountUsd: string;
}

export interface ClaimPeriod {
  id: number;

  startDate: Date;
  endDate: Date;
}

export type CreateClaimPayload = CreateClaimDto & {
  signature: string;
  senderAddress: string;
};

export interface ClaimRecord {
  chainId: string;
  walletAddress: string;
  tokenAddress: string;

  amount: string;
  amountUsd: string;

  period?: {
    startDate: string;
    endDate: string;
  };

  createdAt: string;
}

export const getPeriod = async () => {
  return fetch(`${API_URL}/claim/period`)
    .then((res) => res.json())
    .then((res) => res as { start: string; end: string });
};

export const getClaimedAmount = async (wallet: string, chainId: number) => {
  return fetch(
    `${API_URL}/claim/amount?walletAddress=${wallet}&chainId=${chainId}`,
  )
    .then((res) => res.json())
    .then((res) => res as ClaimAmount[]);
};

export const getLastClaim = async (wallet: string, chainId: number) => {
  return fetch(
    `${API_URL}/claim/last?walletAddress=${wallet}&chainId=${chainId}`,
  )
    .then((res) => res.json())
    .then((res) => res as ClaimRecord | undefined);
};

export const createClaim = async (payload: CreateClaimDto) => {
  const response = await fetch(`${API_URL}/claim`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const content = await response.json();

  if (!response.ok) {
    throw new Error(content.message);
  }

  return content;
};

export const generateSignature = async (
  address: string,
  payload: CreateClaimDto,
) => {
  const utf8 = new TextEncoder().encode(
    [
      payload.walletAddress,
      payload.chainId,

      ...payload.claims.flatMap((claim) => [
        claim.token,
        claim.tokenAddress,
        claim.amount,
        claim.amountUsd,
      ]),
    ].join(""),
  );

  const buffer = await crypto.subtle.digest("SHA-256", utf8);
  const hash = Buffer.from(buffer).toString("base64");

  return `${address}${hash}`;
};

export const getClaimActivePeriod = async (chainId: string) => {
  try {
    return await fetch(`${API_URL}/claim/period/active?chainId=${chainId}`)
      .then((res) => res.json())
      .then((res) => res as ClaimPeriod | undefined);
  } catch (err) {
    return;
  }
};

export const getClaimForPeriod = async (
  chainId: string,
  periodId: number,
  address: string,
) => {
  return fetch(
    `${API_URL}/claim/period/claims?chainId=${chainId}&periodId=${periodId}&address=${address}`,
  )
    .then((res) => res.json())
    .then((res) => res as ClaimAmount[]);
};

export const getClaimProof = async (chainId: string, address: string) => {
  try {
    return fetch(
      `${API_URL}/claim/merkle-tree/proof?chainId=${chainId}&address=${address}`,
    )
      .then((res) => res.json())
      .then(
        (res) =>
          res as {
            proof: string[];
            nonce: number;
            tokens: string[];
            amounts: string[];
            amountsUsd: string[];
          },
      );
  } catch (err) {
    console.error(err);
    return;
  }
};
