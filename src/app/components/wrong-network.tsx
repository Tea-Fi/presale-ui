import { SlButton } from '@shoelace-style/shoelace/dist/react';
import { useModal } from 'connectkit';
import { useConnectorClient } from 'wagmi';

export const WrongNetwork = () => {
  const { openSwitchNetworks } = useModal();
  const { data } = useConnectorClient();

  return (
    <div className="wrong-network">
      <div className="card">
        <h2>Wrong network</h2>
        <h4>Supported network is {data?.chain?.name}</h4>
        <h5>To access the app switch to allowed network.</h5>
        <SlButton onClick={openSwitchNetworks} variant="primary" className="switch_btn">
          Switch to {data?.chain?.name}
        </SlButton>
      </div>
    </div>
  );
};
