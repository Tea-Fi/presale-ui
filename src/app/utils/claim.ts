import { API_URL } from "../config/env";

interface CreateClaimDto {
  walletAddress: string;
  amount: string;
}

type CreateClaimPayload = CreateClaimDto & {
  signature: string;
  senderAddress: string;
};

export const getPeriod = async () => {
  return fetch(`${API_URL}/claim/period`)
    .then(res => res.json())
    .then(res => res as { start: string; end: string; })
}

export const getClaimedAmount = async (wallet: string) => {
  return fetch(`${API_URL}/claim/amount?walletAddress=${wallet}`)
    .then(res => res.json())
    .then(res => res as { amount: string })
};

export const createClaim = async (payload: CreateClaimPayload) => {
  return fetch(`${API_URL}/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export const generateSignature = async (address: string, payload: CreateClaimDto) => {
  const utf8 = new TextEncoder()
    .encode(`${payload.walletAddress}${payload.amount}`)

  const buffer = await crypto.subtle.digest('SHA-256', utf8)
  const hash = Buffer.from(buffer).toString('base64');

  return `${address}${hash}`;
}
