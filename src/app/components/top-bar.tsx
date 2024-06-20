import { NavLink } from 'react-router-dom';
import { Wallet } from './wallet';
import teaSwap from '../../assets/icons/tea-swap.svg';

export const TopBar = () => {
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
          </ul>
        </nav>
        <Wallet />
      </div>
    </div>
  );
};
