import { /*React,*/ useLayoutEffect } from "react";
import { TopBar } from "./top-bar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUserContext } from "../providers/user.context";
import { BackgroundBeams } from "./ui";
import { MobileDrawerMenu } from "./mobile-drawer-menu";
import { RevokeApprovalDialog } from "./revoke-approval-dialog";

export const Layout = () => {
  const navigate = useNavigate();

  const { pathname } = useLocation();
  const { status } = useUserContext();

  // useLayoutEffect(() => {
  //   if (status === LoginStatus.LOGGED_OUT) {
  //     navigate("/");
  //   }

  //   if (status === LoginStatus.LOGGED_IN && code) {
  //     getReferralTreeById(Number(referralId)).then((res) => {
  //       setReferralCode(res?.referral ?? "");
  //     });
  //   }
  // }, [navigate, status]);

  useLayoutEffect(() => {
    if (pathname === "/") {
      navigate("/claim");
    }
  }, [pathname, navigate]);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  if (status === null) {
    return null;
  }

  return (
    <main vaul-drawer-wrapper="" className="flex flex-col min-h-screen min-v-screen dark">
      <TopBar />
      <Outlet />
      {pathname !== "/" && <BackgroundBeams className="hidden pointer-events-none md:block" />}

      {/* MODALS, DRAWERS */}
      <MobileDrawerMenu />
      <RevokeApprovalDialog />
    </main>
  );
};
