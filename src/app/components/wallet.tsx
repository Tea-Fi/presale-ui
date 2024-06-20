import { useEffect, useRef, useState } from 'react';
import { SlButton } from '@shoelace-style/shoelace/dist/react';
import { useAccountModal } from '@rainbow-me/rainbowkit';

import { useWalletContext } from '../context/wallet.context';
import { ConnectWallet } from './connect-wallet';
import { useAccount } from 'wagmi';

export const Wallet = () => {
  const [walletOpen, setWalletOpen] = useState(false);
  const { status, account } = useWalletContext();
  const { chain } = useAccount();

  const { openAccountModal } = useAccountModal();

  const anchorRef = useRef(null);
  useEffect(() => {
    if (walletOpen) {
      document.addEventListener('click', closeOutsideDialog);
    }

    function closeOutsideDialog(event: MouseEvent) {
      if (anchorRef.current && !(anchorRef.current as HTMLElement).contains(event.target as HTMLElement)) {
        setWalletOpen(false);
      }
    }

    return () => {
      document.removeEventListener('click', closeOutsideDialog);
    };
  }, [walletOpen]);

  return (
    <div className="wallet">
      {account ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {chain && (
            <SlButton outline size="medium" className="chain_name">
              {chain.name}
            </SlButton>
          )}
          <SlButton className="popup__anchor" outline size="medium" onClick={openAccountModal}>
            {account.slice(0, 6)}...{account.slice(-4)}
            <i slot="suffix" id="wallet-status-icon" className={status}></i>
          </SlButton>
        </div>
      ) : (
        <ConnectWallet />
      )}
    </div>
  );
};
