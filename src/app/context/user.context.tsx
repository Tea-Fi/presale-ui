import type { FunctionComponent, ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loginMapping } from '../utils/constants';

export interface LoginResponse {
  status: LoginStatus | null;
}

export enum LoginStatus {
  LOGGED_OUT = 'not-logged-in',
  WRONG_CODE = 'wrong-code',
  CODE_VERIFIED = 'code-verified',
  LOGGED_IN = 'logged-in',
}

export interface UserContext {
  status: LoginStatus | null;
  login: (code: string) => Promise<void>;
  agreeToTerms: () => void;
}

export const UserContext = createContext<UserContext | null>(null);

export const UserContextProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<LoginStatus | null>(null);

  async function login(code: string): Promise<void> {
    try {
      const validKeys = Object.keys(loginMapping);
      const result = validKeys.filter((item) => item === code);
      const isCorrect = result.length > 0;
      if (!isCorrect) {
        setStatus(LoginStatus.WRONG_CODE);
        setTimeout(() => setStatus(LoginStatus.LOGGED_OUT), 3000);
      } else {
        window.localStorage.setItem('referral', String(loginMapping[code].id));
        if (window.localStorage.getItem('agreedToTerms') === 'true') {
          setStatus(LoginStatus.LOGGED_IN);
        } else {
          setStatus(LoginStatus.CODE_VERIFIED);
        }
      }
    } catch (error) {
      setStatus(LoginStatus.WRONG_CODE);
      setTimeout(() => setStatus(LoginStatus.LOGGED_OUT), 3000);
    }
  }

  const validateAgreedToTerms = useCallback(async (agreedToTerms: boolean) => {
    if (agreedToTerms) {
      setStatus(LoginStatus.LOGGED_IN);
    } else {
      setStatus(LoginStatus.LOGGED_OUT);
    }
  }, []);

  const agreeToTerms = useCallback(async () => {
    window.localStorage.setItem('agreedToTerms', 'true');
    validateAgreedToTerms(true);
  }, [validateAgreedToTerms]);

  useEffect(() => {
    validateAgreedToTerms(window.localStorage.getItem('agreedToTerms') === 'true');
  }, [validateAgreedToTerms]);

  return (
    <UserContext.Provider
      value={{
        status,
        agreeToTerms,
        login,
      }}
      children={children}
    />
  );
};

export const useUserContext = (): UserContext => {
  const contextValue = useContext(UserContext);
  if (!contextValue) {
    throw new Error('Tried to use template context from outside the provider');
  }
  return contextValue;
};
