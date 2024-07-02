import React, { useEffect } from 'react';
import { SlButton } from '@shoelace-style/shoelace/dist/react';

import { useWalletContext } from '../providers/wallet.context';

export const ConnectWallet = () => {
  const { connect } = useWalletContext();

  const anchorRef = React.useRef(null);
  const [walletConnectDialog, setWalletConnectDialog] = React.useState(false);

  useEffect(() => {
    if (walletConnectDialog) {
      document.addEventListener('click', closeOutsideDialog);
    }

    function closeOutsideDialog(event: MouseEvent) {
      if (anchorRef.current && !(anchorRef.current as HTMLElement).contains(event.target as HTMLElement)) {
        setWalletConnectDialog(false);
      }
    }

    return () => {
      document.removeEventListener('click', closeOutsideDialog);
    };
  }, [walletConnectDialog]);

  return (
    <div className="connect-wallet">
      <SlButton className="popup__anchor" variant="neutral" size="medium" onClick={connect} slot="anchor">
        Connect Wallet
      </SlButton>
    </div>
  );
};
