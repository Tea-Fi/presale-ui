import { Navigate, Outlet, useParams } from "react-router-dom";
import { useGetReferral } from "../hooks/useGetReferral.ts";

const ProtectedRoutes = () => {
  const { code } = useParams();
  const { data, isError, isLoading } = useGetReferral(code);

  if (isLoading) return;

  if (isError) {
    return <Navigate to="/code-not-found" />;
  }

  return data ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoutes;
