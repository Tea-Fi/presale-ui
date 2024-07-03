import { API_URL } from "../config/env";
import { api } from "./api";
import { /*loginMapping,*/ Referral } from "./constants";

export type { Referral } from "./constants";

export interface CreateReferralPayload {
  walletAddress: string;
  referralCode: string;
  fee: number;
}

// export const loginMappingFlattened = (_loginMapping?: { [key: string]: Referral }): { [key: string]: Referral } => {
//   const workingLoginMapping = _loginMapping || loginMapping;
//   let flattened: { [key: string]: Referral } = {};
//   for (let key of Object.keys(workingLoginMapping)) {
//     if (workingLoginMapping[key]?.subleads != undefined) {
//       flattened = Object.assign(flattened, loginMappingFlattened(workingLoginMapping[key].subleads));
//     }
//     flattened[key] = workingLoginMapping[key];
//   }
//   return flattened;
// }

export const validCode = async (code: string): Promise<boolean> => {
  try {
    const lead = await api.get(`${API_URL}/leads?code=${code}`)
      .then(res => res.data);

    return lead;
  } catch (err) {
    return false;
  }
}

export const referralCodeExists = async (code: string): Promise<boolean> => {
  try {
    const lead = await api.get(`${API_URL}/leads?code=${code}`)

    return lead.status === 200;
  } catch (err) {
    return false;
  }
}

export const createReferral = async (code: string, payload: CreateReferralPayload) => {
  const result = await api.post(`${API_URL}/leads/${code}`, JSON.stringify(payload), {
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

// export const getReferralCodeById = (id: number | string): string | undefined => { 
//   const _id = parseInt(id as string, 10);
//   const referralsTree = loginMappingFlattened();

//   for (let key of Object.keys(referralsTree)) {
//     if (referralsTree[key].id == _id) {
//       return key;
//     }
//   }
// }

const getReferralTree = async (query: string): Promise<Referral | undefined> => {
  try {
    const response = await api.get(`${API_URL}/leads/tree?${query}`)

    if (response.status !== 200) {
      throw new Error('Code not found');
    }

    const result = typeof response.data === 'string' 
      ? JSON.parse(response.data)
      : response.data;

    return result;
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
