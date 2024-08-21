import type { FunctionComponent, ReactNode } from "react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { getReferralTreeByCode } from "../utils/referrals";
import { useLocalStorage } from "usehooks-ts";
import { useReferralStore } from "../state/referal.store.ts";

export interface LoginResponse {
  status: LoginStatus | null;
}

export enum LoginStatus {
  LOGGED_OUT = "not-logged-in",
  WRONG_CODE = "wrong-code",
  CODE_VERIFIED = "code-verified",
  LOGGED_IN = "logged-in",
}

interface TermsOfService {
  agree: () => void;
  disagree: () => void;
}

export interface UserContext {
  status: LoginStatus | null;
  login: (code: string) => Promise<void>;
  logout: () => void;
  terms: TermsOfService;
}

export const UserContext = createContext<UserContext | null>(null);

export const UserContextProvider: FunctionComponent<{
  children: ReactNode;
}> = ({ children }) => {
  const [status, setStatus] = useState<LoginStatus | null>(null);
  const { setReferralId, setReferralCode, reset } = useReferralStore();

  const [agreedToTerms, setAgreedToTerms] = useLocalStorage<boolean>(
    "agreedToTerms",
    false,
  );

  async function login(code: string): Promise<void> {
    try {
      const referralTree = await getReferralTreeByCode(code);

      if (!referralTree) {
        setStatus(LoginStatus.WRONG_CODE);
        setTimeout(() => setStatus(LoginStatus.LOGGED_OUT), 3000);
        return;
      }

      setReferralId(referralTree.id);
      setReferralCode(referralTree.referral || "");

      if (!agreedToTerms) {
        setStatus(LoginStatus.CODE_VERIFIED);
        return;
      }

      setStatus(LoginStatus.LOGGED_IN);
    } catch (error) {
      setStatus(LoginStatus.WRONG_CODE);
      setTimeout(() => setStatus(LoginStatus.LOGGED_OUT), 3000);
    }
  }

  async function logout() {
    setStatus(LoginStatus.LOGGED_OUT);
    reset();
  }

  const agreeToTerms = useCallback(async () => {
    setAgreedToTerms(true);
    setStatus(LoginStatus.LOGGED_IN);
  }, []);

  const disagreeToTerms = useCallback(async () => {
    setAgreedToTerms(false);
    setStatus(LoginStatus.LOGGED_OUT);
  }, []);

  useEffect(() => {
    if (agreedToTerms) {
      setStatus(LoginStatus.LOGGED_IN);
    } else {
      setStatus(LoginStatus.LOGGED_OUT);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        status,
        login,
        logout,
        terms: {
          agree: agreeToTerms,
          disagree: disagreeToTerms,
        },
      }}
      children={children}
    />
  );
};

export const useUserContext = (): UserContext => {
  const contextValue = useContext(UserContext);
  if (!contextValue) {
    throw new Error("Tried to use template context from outside the provider");
  }
  return contextValue;
};
