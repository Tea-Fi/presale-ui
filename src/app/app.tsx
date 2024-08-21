import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout";
import { Login } from "./pages/login";
import { Buy } from "./pages/buy";
import { Claim } from "./pages/claim";
import { NotFound } from "./pages/not-found";
import { useWalletContext } from "./providers/wallet.context";
import { WrongNetwork } from "./components/wrong-network";
import { Referrals } from "./pages/referrals";
import { Options } from "./pages/options";
import { useAccountEffect } from "wagmi";
import { track } from "./utils/analytics";
import { CodeNotFound } from "./pages/code-not-found.tsx";
import ProtectedRoutes from "./utils/ProtectedRoutes.tsx";
import AmbassadorProtectedRoutes from "./utils/AmbassadorProtectedRoutes.tsx";

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
          <Route path="/" element={<Login />} />

          <Route element={<ProtectedRoutes />}>
            <Route path="/:code/buy" element={<Buy />} />
            <Route path="/:code/options" element={<Options />} />
            <Route path="/:code/claim" element={<Claim />} />
            <Route element={<AmbassadorProtectedRoutes />}>
              <Route path="/:code/dashboard" element={<Referrals />} />
            </Route>
          </Route>
          <Route path="/code-not-found" element={<CodeNotFound />} />
          <Route path="*" element={<NotFound />} />
        </Route >
      </Routes >
    </Router >
  );
}
