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

export function App() {
  const { chainId, unsupportedChain } = useWalletContext();

  useAccountEffect({
    onConnect(data) {
      track({
        eventName: 'wallet_connect',
        parameters: {
          chainId: data.chainId,
          chain: data.chain?.name,
          address: data.address,
        }
      })
    }
  })

  if (chainId && unsupportedChain) {
    return <WrongNetwork />;
  }

  return (
    <Router basename="/">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Login />} />
          <Route path="/:code/buy" element={<Buy />} />
          <Route path="/:code/options" element={<Options />} />
          <Route path="/:code/claim" element={<Claim />} />
          <Route path="/:code/dashboard" element={<Referrals />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}
