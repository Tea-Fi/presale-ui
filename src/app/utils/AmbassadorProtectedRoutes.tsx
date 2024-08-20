import { Navigate, Outlet } from "react-router-dom";
import { useAccountStore } from "../state/user.store.ts";

const AmbassadorProtectedRoutes = () => {
    const { isAmbassador, isInitiated } = useAccountStore();
    return isInitiated && isAmbassador ? <Outlet /> : <Navigate to="/" />
}

export default AmbassadorProtectedRoutes;