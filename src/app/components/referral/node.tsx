import React from "react";
import { toast } from "react-toastify";
import { Copy } from "lucide-react";

import { ReferralStats, usdFormatter } from "./common";

import { cn, parseHumanReadable } from "../../utils";

interface ReferralNodeProps {
  code: string;
  walletAddress: string;

  fee?: number;
  stats?: ReferralStats;
}

export const ReferralNode = (props: ReferralNodeProps) => {
  const onNodeClick = React.useCallback((id: string) => {
    navigator?.clipboard?.writeText(id);
    toast.success("Copied code to clipboard");
  }, []);

  const getShortAccount = React.useCallback(
    (account = "") => `${account.slice(0, 6)}...${account.slice(-4)}`,
    [],
  );

  return (
    <div
      className={cn(
        "relative rounded-lg w-full h-full",
        "flex flex-col justify-start items-start",
        "text-[#ff23b2] text-sm",
      )}
      onClick={() => onNodeClick(props.code)}
    >
      <div className={cn("text-[0.75rem] font-bold text-center w-full")}>
        {props.code.toUpperCase()}
      </div>

      <div className="flex justify-between w-full">
        <div className={cn("text-[0.75rem]")}>
          {getShortAccount(props.walletAddress)}
        </div>

        <div
          className={cn(
            "rounded-md absolute -top-1 -right-1 p-1",
            "cursor-pointer scale-75 transition-all duration-300",
            "hover:shadow-lg hover:scale-90 hover:bg-slate-900",
          )}
        >
          <Copy />
        </div>
      </div>

      <div className="flex justify-between w-full">
        <div className={cn("text-[0.75rem] flex flex-col items-start")}>
          [{" "}
          {`$${usdFormatter.format(parseHumanReadable(props?.stats?.soldInUsd ?? 0n, 10, 2))}`}{" "}
          ]
        </div>

        <div className={cn("text-[0.75rem]")}>/ {(props?.fee || 0) / 100}%</div>
      </div>

      <div className={cn("text-[0.75rem]")}>
        Sold{" "}
        {`${usdFormatter.format(parseHumanReadable(props?.stats?.tokensSold ?? 0n, 18, 6))} $TEA`}
      </div>
    </div>
  );
};
