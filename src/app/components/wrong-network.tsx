import { SlButton } from "@shoelace-style/shoelace/dist/react";
import { useModal, useChains } from "connectkit";
import { useMemo } from "react";

import { SUPPORTED_NETWORKS } from "../config";

interface Props {
  networkName?: string;
  text?: string;
}

export const WrongNetwork = ({ networkName, text }: Props) => {
  const { openSwitchNetworks } = useModal();

  const chains = useChains();

  const supportedNetwork = useMemo(
    () => chains.find((chain) => SUPPORTED_NETWORKS.includes(chain.id)),
    [chains]
  );

  return (
    <div className="wrong-network">
      <div className="card">
        {text ? (
          <h2 style={{ fontSize: 18 }}>{text}</h2>
        ) : (
          <>
            <h2>Wrong network</h2>
            {supportedNetwork && (
              <h4>
                Supported network is {networkName || supportedNetwork.name}
              </h4>
            )}
            <h5>To access the app switch to allowed network.</h5>
          </>
        )}
        <SlButton
          onClick={openSwitchNetworks}
          variant="primary"
          className="switch_btn"
        >
          {supportedNetwork
            ? `Switch to ${networkName || supportedNetwork.name}`
            : "Switch"}
        </SlButton>
      </div>
    </div>
  );
};
