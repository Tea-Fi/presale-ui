import { SlButton } from "@shoelace-style/shoelace/dist/react";
import { useModal, useChains } from "connectkit";
import { useMemo } from "react";

import { SUPPORTED_NETWORK } from "../config";

export const WrongNetwork = () => {
  const { openSwitchNetworks } = useModal();

  const chains = useChains();

  const supportedNetwork = useMemo(
    () => chains.find((chain) => `${chain.id}` === SUPPORTED_NETWORK),
    [chains]
  );

  return (
    <div className="wrong-network">
      <div className="card">
        <h2>Wrong network</h2>
        {supportedNetwork && (
          <h4>Supported network is {supportedNetwork.name}</h4>
        )}
        <h5>To access the app switch to allowed network.</h5>
        <SlButton
          onClick={openSwitchNetworks}
          variant="primary"
          className="switch_btn"
        >
          {supportedNetwork ? `Switch to ${supportedNetwork.name}` : "Switch"}
        </SlButton>
      </div>
    </div>
  );
};
