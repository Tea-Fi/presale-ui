// import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { Wallet } from "./wallet";
import teaSwap from "../../assets/icons/tea-swap.svg";
// import { loginMapping } from "../utils/constants";

export const TopBar = () => {
  // const [haveSubleds, setHaveSubleads] = useState(false);

  // useEffect(() => {
  //   const referral = window.localStorage.getItem("referral") || "0";
  //   const exists = Object.values(loginMapping).find(
  //     (el) => el.id === +referral
  //   );
  //   setHaveSubleads(Boolean(exists?.subleads?.length));
  // }, []);

  return (
    <div className="top-bar">
      <div className="container">
        <div className="top-bar__logo">
          <img src={teaSwap} alt="Tea" />
        </div>
        <nav className="top-bar__menu">
          <ul>
            <li>
              <NavLink to="/buy">Buy</NavLink>
            </li>
            <li>
              <NavLink to="/claim">Claim</NavLink>
            </li>
            {/* {haveSubleds && (
              <li>
                <NavLink to="/referrals">Referrals</NavLink>
              </li>
            )} */}
          </ul>
        </nav>
        <Wallet />
      </div>
    </div>
  );
};
