import { useState, useEffect, useCallback } from "react";
import { LoginStatus, useUserContext } from "../providers/user.context";
import { useNavigate, useSearchParams } from "react-router-dom";
import useLoginInfo from "./useLoginInfo.ts";
import { useReferralStore } from "../state/referal.store.ts";

const useLogin = (inputCode?: string) => {
  const [searchParams] = useSearchParams();
  const referralParam = searchParams.get("r");
  const navigate = useNavigate();

  const { isLoggedIn } = useLoginInfo();
  const { referralCode } = useReferralStore();
  const [message, setMessage] = useState<string | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const { login, logout, status, terms } = useUserContext();

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputCode) {
      setMessage("Please enter an access code");
      setTimeout(setMessage, 3000, null);
      return;
    }
    login(inputCode.trim());
  };

  const handleReferralLogin = useCallback(() => {
    if (isLoggedIn || !referralParam) return;

    login(referralParam);
  }, [isLoggedIn, referralParam]);

  const closeDialog = useCallback(() => {
    if (status === LoginStatus.CODE_VERIFIED) {
      terms.disagree();
    }
    setDialogOpen(false);
  }, [status, terms]);

  const handleStatusSwitch = () => {
    switch (status) {
      case LoginStatus.LOGGED_IN:
        if (!referralCode) {
          logout();
          return;
        }
        setDialogOpen(false);
        setTimeout(() => navigate(`/${referralCode}/options`), 250);
        break;

      case LoginStatus.LOGGED_OUT:
        setDialogOpen(false);
        break;

      case LoginStatus.CODE_VERIFIED:
        setDialogOpen(true);
        break;
      case LoginStatus.WRONG_CODE:
        setMessage("The access code does not exist. You shall not pass!");
        setTimeout(setMessage, 3000, null);
        break;
    }
  };
  useEffect(() => {
    handleReferralLogin();
  }, []);

  useEffect(() => {
    handleStatusSwitch();
  }, [navigate, status]);

  return {
    inputCode,
    message,
    isDialogOpen,
    handleLoginSubmit,
    handleTermsAgree: terms.agree,
    closeDialog,
  };
};

export default useLogin;
