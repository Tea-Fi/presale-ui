import { Outlet } from "react-router-dom";
import { useIsAmbassador } from "../hooks/useIsAmbassador";
import { WrongNetwork } from "../components/wrong-network";
import { useAccount } from "wagmi";

const AmbassadorProtectedRoutes = () => {
  const { hasChecked, isLoading } = useIsAmbassador();
  const { chainId } = useAccount();
  if (isLoading || !hasChecked) return;

  if (chainId && ![1, 11155111].includes(chainId)) {
    return <WrongNetwork networkName="Ethereum" text="Dashboard is available only on Ethereum" />;
  }
  return <Outlet />;
  // return hasChecked && isAmbassador ? <Outlet /> : <Navigate to="/" />;
};

export default AmbassadorProtectedRoutes;
