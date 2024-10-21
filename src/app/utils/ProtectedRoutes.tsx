import { Navigate, Outlet, useParams } from "react-router-dom";
import { useGetReferral } from "../hooks/useGetReferral.ts";

const ProtectedRoutes = () => {
  const { code } = useParams();
  const { error, isLoading } = useGetReferral(code);

  if (isLoading) return;

  if (error) {
    return <Navigate to="/code-not-found" />;
  }

  return <Outlet />;
  // return data ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoutes;
