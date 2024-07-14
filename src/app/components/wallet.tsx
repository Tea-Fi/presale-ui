import { useEffect, useRef, useState } from 'react';
import { ConnectKitButton } from 'connectkit';


export const Wallet = () => {
  const [walletOpen, setWalletOpen] = useState(false);


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
      <ConnectKitButton />
    </div>
  );
};
