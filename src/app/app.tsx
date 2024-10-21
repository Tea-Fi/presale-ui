import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useAccountEffect } from "wagmi";

import { Layout } from "./components/layout";
import { Claim } from "./pages/claim";
import { NotFound } from "./pages/not-found";
import { useWalletContext } from "./providers/wallet.context";
import { WrongNetwork } from "./components/wrong-network";
import { Referrals } from "./pages/referrals";
import { Options } from "./pages/options";
import { track } from "./utils/analytics";
import { CodeNotFound } from "./pages/code-not-found.tsx";
import AmbassadorProtectedRoutes from "./utils/AmbassadorProtectedRoutes.tsx";
import ClaimProtectedRoutes from "./utils/ClaimProtectedRoutes.tsx";

export function App() {
  const { chainId, unsupportedChain } = useWalletContext();

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
          <Route path="/buy" element={<Navigate to={`/`} replace={true} />} />
          <Route path="/" element={<Options />} />

          <Route element={<ClaimProtectedRoutes />}>
            <Route path="/claim" element={<Claim />} />
          </Route>

          <Route element={<AmbassadorProtectedRoutes />}>
            <Route path="/dashboard" element={<Referrals />} />
          </Route>
          <Route path="/code-not-found" element={<CodeNotFound />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}
