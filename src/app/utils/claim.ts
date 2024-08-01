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

export type CreateClaimPayload = CreateClaimDto & {
  signature: string;
  senderAddress: string;
};

export const getPeriod = async () => {
  return fetch(`${API_URL}/claim/period`)
    .then(res => res.json())
    .then(res => res as { start: string; end: string; })
}

export const getClaimedAmount = async (wallet: string, chainId: number) => {
  return fetch(`${API_URL}/claim/amount?walletAddress=${wallet}&chainId=${chainId}`)
    .then(res => res.json())
    .then(res => res as ClaimAmount[])
};

export const createClaim = async (payload: CreateClaimPayload) => {
  const response = await fetch(`${API_URL}/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const content = await response.json();

  if (!response.ok) {
    throw new Error(content.message);
  }

  return content;
}

export const generateSignature = async (address: string, payload: CreateClaimDto) => {
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
    ].join(''),
  );

  const buffer = await crypto.subtle.digest('SHA-256', utf8)
  const hash = Buffer.from(buffer).toString('base64');

  return `${address}${hash}`;
}
