import { SignMessageMutate } from "wagmi/query";
import { API_URL } from "../config/env"
import { api } from "./api"

interface LoginResponse {
  accessToken: string;
}

export const AUTH_ACCESS_TOKEN_KEY = 'accessToken';

export const authenticate = async (code: string, signMessage: SignMessageMutate<string>) => {
  const token = getActiveAccessToken(); 
 
  if (token) {
    return Promise.resolve(token);
  }

  const payload = JSON.stringify({ code })
  const message = await api.post(`${API_URL}/auth/init`, payload, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.data as string)

  return new Promise((resolve, reject) => {
    signMessage({ message }, {
      onSuccess(data) {
        login(code, data)
          .then(result => {
            window.localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, result.accessToken);
            resolve(result.accessToken);
          })
          .catch(reject)
      },
      onError(error, variables, context) {
          reject(error);
      },
    });
  })
}

const getActiveAccessToken = () => {
  const accessToken = window.localStorage.getItem(AUTH_ACCESS_TOKEN_KEY);

  if (!accessToken) {
    return
  }

  const decodedRaw = Buffer.from(accessToken.split('.')[0], 'base64').toString();
  const decoded = JSON.parse(decodedRaw) as { exp: number };

  if (Date.now() + 10 * 60 * 1000 >= (decoded.exp * 1000)) {
    window.localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
    return
  }

  return accessToken;
}

const login = async (code: string, signedHash: string) => {
  const payload = JSON.stringify({ code, signedHash });
  const response = await api.post(`${API_URL}/auth/login`, payload, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (response.status !== 200) {
    throw new Error(response.data)
  }

  const result = typeof response.data === 'string'
    ? JSON.parse(response.data)
    : response.data

  return result as LoginResponse;
}