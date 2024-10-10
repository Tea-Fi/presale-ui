import { Navigate, Outlet } from "react-router-dom";
import { useAccount } from "wagmi";

import { WrongNetwork } from "../components/wrong-network";

const ClaimProtectedRoutes = () => {
  const { isConnected, chainId } = useAccount();

  if (chainId && chainId !== 137) {
    return (
      <WrongNetwork
        networkName="Polygon"
        text="Claim is available only on Polygon"
      />
    );
  }
  return isConnected ? <Outlet /> : <Navigate to="/" />;
};

export default ClaimProtectedRoutes;
