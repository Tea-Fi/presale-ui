import { Navigate, Outlet } from "react-router-dom";
import { useAccount } from "wagmi";

const ClaimProtectedRoutes = () => {
  const { isConnected } = useAccount();

  return isConnected ? <Outlet /> : <Navigate to="/" />;
};

export default ClaimProtectedRoutes;
