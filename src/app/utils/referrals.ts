import { api } from "./api";
import { loginMapping, Referral } from "./constants";

export type { Referral } from "./constants";

export interface CreateReferralPayload {
  walletAddress: string;
  referralCode: string;
  fee: number;
}

export const loginMappingFlattened = (_loginMapping?: { [key: string]: Referral }): { [key: string]: Referral } => {
  const workingLoginMapping = _loginMapping || loginMapping;
  let flattened: { [key: string]: Referral } = {};
  for (let key of Object.keys(workingLoginMapping)) {
    if (workingLoginMapping[key]?.subleads != undefined) {
      flattened = Object.assign(flattened, loginMappingFlattened(workingLoginMapping[key].subleads));
    }
    flattened[key] = workingLoginMapping[key];
  }
  // _loginMapping == undefined && console.log('flattened', flattened) // dev logs
  return flattened;
}

export const validCode = async (code: string): Promise<boolean> => {
  try {
    const lead = await api.get(`/leads?code=${code}`)
      .then(res => res.data);

    return lead;
  } catch (err) {
    return false;
  }
}

export const referralCodeExists = async (code: string): Promise<boolean> => {
  try {
    const lead = await api.get(`/leads?code=${code}`)

    return lead.status === 200;
  } catch (err) {
    return false;
  }
}

export const createReferral = async (code: string, payload: CreateReferralPayload) => {
  const result = await api.post(`/leads/${code}`, JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.data)
    .then(res => typeof res === 'string' ? JSON.parse(res) : res);

  if (result.error) {
    throw new Error(result.error);
  }

  return result as Referral;
}

export const getReferralCodeById = (id: number | string): string | undefined => { 
  const _id = parseInt(id as string, 10);
  const referralsTree = loginMappingFlattened();

  for (let key of Object.keys(referralsTree)) {
    if (referralsTree[key].id == _id) {
      return key;
    }
  }
}

const getReferralTree = async (query: string): Promise<Referral | undefined> => {
  try {
    const tree = await api.get(`/leads/tree?${query}`)
      .then(res => typeof res.data === 'string' ? JSON.parse(res.data) : res.data)
      .then(res => res as Referral);

    return tree;
  } catch (err) {
    return;
  }
}

export const getReferralTreeByCode = async (code: string) => {
  return getReferralTree(`code=${code}`);
}

export const getReferralTreeByWallet = async (wallet: string) => {
  return getReferralTree(`walletAddress=${wallet}`);
}

export const getReferralTreeById = async (id: number | string) => {
  return getReferralTree(`id=${id}`);
}
