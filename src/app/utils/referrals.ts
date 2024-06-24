import { loginMapping, Referral } from "./constants";

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

export const validCode = (code: string): boolean => {
  const validKeys = Object.keys(loginMappingFlattened());
  const result = validKeys.filter((item) => item === code.toUpperCase());
  return result.length > 0;
}

export const getReferralTreeByCode = (code: string): Referral | undefined => {
  return loginMappingFlattened()[code.toUpperCase() as string];
}
