import { Navigate, Outlet } from "react-router-dom";
import { useIsAmbassador } from "../hooks/useIsAmbassador";

const AmbassadorProtectedRoutes = () => {
  const { isAmbassador, hasChecked, isLoading } = useIsAmbassador();
  if (isLoading || !hasChecked) return;

  return hasChecked && isAmbassador ? <Outlet /> : <Navigate to="/" />;
};

export default AmbassadorProtectedRoutes;
