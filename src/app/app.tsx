import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useAccountEffect } from "wagmi";

import { Layout } from "./components/layout";
import { Login } from "./pages/login";
import { Buy } from "./pages/buy";
import { Claim } from "./pages/claim";
import { NotFound } from "./pages/not-found";
import { useWalletContext } from "./providers/wallet.context";
import { WrongNetwork } from "./components/wrong-network";
import { Referrals } from "./pages/referrals";
import { Options } from "./pages/options";
import { track } from "./utils/analytics";
import { CodeNotFound } from "./pages/code-not-found.tsx";
import ProtectedRoutes from "./utils/ProtectedRoutes.tsx";
import AmbassadorProtectedRoutes from "./utils/AmbassadorProtectedRoutes.tsx";
import ClaimProtectedRoutes from "./utils/ClaimProtectedRoutes.tsx";
import { useReferralCode } from "./hooks/useReferralCode.ts";
import { useIsPresaleEnded } from "./hooks/useIsPresaleEnded.ts";

export function App() {
  const { chainId, unsupportedChain } = useWalletContext();
  const code = useReferralCode();
  const isFinished = useIsPresaleEnded();

  useAccountEffect({
    onConnect(data) {
      track({
        eventName: "wallet_connect",
        parameters: {
          chainId: data.chainId,
          chain: data.chain?.name,
          address: data.address,
        },
      });
    },
  });

  if (chainId && unsupportedChain) {
    return <WrongNetwork />;
  }

  return (
    <Router basename="/">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Login />} />

          <Route element={<ProtectedRoutes />}>
            <Route
              path="/:code/buy"
              element={
                isFinished ? (
                  <Navigate to={`/${code}/options`} replace={true} />
                ) : (
                  <Buy />
                )
              }
            />
            <Route path="/:code/options" element={<Options />} />

            <Route element={<ClaimProtectedRoutes />}>
              <Route path="/:code/claim" element={<Claim />} />
            </Route>

            <Route element={<AmbassadorProtectedRoutes />}>
              <Route path="/:code/dashboard" element={<Referrals />} />
            </Route>
          </Route>
          <Route path="/code-not-found" element={<CodeNotFound />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}
