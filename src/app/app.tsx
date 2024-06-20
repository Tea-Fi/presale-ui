import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout";
import { Login } from "./pages/login";
import { Buy } from "./pages/buy";
import { Claim } from "./pages/claim";
import { NotFound } from "./pages/not-found";
import { useWalletContext } from "./context/wallet.context";
import { WrongNetwork } from "./components/wrong-network";
import { Referrals } from "./pages/referrals";

export function App() {
  const { chainId, unsupportedChain } = useWalletContext();

  if (chainId && unsupportedChain) {
    return <WrongNetwork />;
  }

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Login />} />
          <Route path="/buy" element={<Buy />} />
          <Route path="/claim" element={<Claim />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}
