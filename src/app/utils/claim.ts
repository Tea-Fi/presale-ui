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

export interface ClaimActivePeriod {
  id: number;

  startDate: Date;
  endDate: Date;
}

export interface ClaimPeriod {
  start: string;
  end: string;
}
export interface ClaimPeriodParsed {
  start: Date;
  end: Date;
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

export interface ClaimProof {
  proof: string[];
  nonce: number;
  tokens: string[];
  amounts: string[];
  amountsUsd: string[];
}

export const getPeriod = async () => {
  return fetch(`${API_URL}/claim/period`)
    .then((res) => res.json())
    .then((res) => res as { start: string; end: string });
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
      .then((res) => res as ClaimActivePeriod | undefined);
  } catch (err) {
    return;
  }
};
