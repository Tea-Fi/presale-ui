import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout";
import { Login } from "./pages/login";
import { Buy } from "./pages/buy";
import { Claim } from "./pages/claim";
import { NotFound } from "./pages/not-found";
import { useWalletContext } from "./providers/wallet.context";
import { WrongNetwork } from "./components/wrong-network";
import { Referrals } from "./pages/referrals";
import { Options } from "./pages/options";
import { DashboardPage } from "./pages/dashboard";

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
          <Route path="/options" element={<Options />} />
          <Route path="/claim" element={<Claim />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}
