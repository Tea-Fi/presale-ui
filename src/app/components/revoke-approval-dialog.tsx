import { Address, maxUint256 } from "viem";
import { CheckmarkText } from "./checkmark-text";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui";
import { getChainId } from "@wagmi/core";
import { wagmiConfig } from "../config";
import { PRESALE_CONTRACT_ADDRESS, USDT } from "../utils/constants";
import { SAFE_ERC20_ABI } from "../utils/safe-erc20-abi";
import { useEffect, useState } from "react";
import { useConnectedWalletMobile, useRevokeApprovalDialog } from "../hooks";
import Spinner from "./spinner";
import { useAccount, useTransactionCount, useWriteContract } from "wagmi";

export const RevokeApprovalDialog = () => {
  const chainId = getChainId(wagmiConfig);
  const { isOpened, setOpened, setAllowanceChanged } =
    useRevokeApprovalDialog();
  const { open } = useConnectedWalletMobile();

  const [isLoading, setIsLoading] = useState<boolean>();

  const [isRevokePending, setRevokePending] = useState<boolean>(false);
  const [isRevokeError, setRevokeError] = useState<boolean>(false);
  const [isRevokeSuccess, setRevokeSuccess] = useState<boolean>(false);

  const [isApprovePending, setApprovePending] = useState<boolean>(false);
  const [isApproveError, setApproveError] = useState<boolean>(false);
  const [isApproveSuccess, setApproveSuccess] = useState<boolean>(false);

  const account = useAccount();
  const { data: txCount, refetch } = useTransactionCount({
    address: account?.address,
  });

  const { writeContract, isError } = useWriteContract({ config: wagmiConfig });

  const handleApproveUSDT = (isRevoke: boolean = true) => {
    try {
      setIsLoading(true);

      if (isRevoke) {
        setRevokePending(true);
      } else {
        setApprovePending(true);
      }

      writeContract({
        address: USDT[chainId],
        abi: SAFE_ERC20_ABI,
        functionName: "approve",
        args: [
          PRESALE_CONTRACT_ADDRESS[chainId] as Address,
          isRevoke ? 0 : maxUint256,
        ],
      });

      // opens mobile metamask automaticly
      // NOTE: works only on mobile
      open();
    } catch (error) {
      if (isRevoke) {
        setRevokeError(true);
      } else {
        setApproveError(true);
      }
    }
  };

  useEffect(() => {
    if (isRevokePending || isApprovePending) {
      return;
    }

    if (isRevokeSuccess && !isApproveSuccess) {
      return;
    }

    setRevokePending(false);
    setRevokeError(false);
    setRevokeSuccess(false);

    setApproveSuccess(false);
    setApproveError(false);
    setApprovePending(false);

    setAllowanceChanged(false);
  }, [isOpened]);

  useEffect(() => {
    if (isError) {
      setIsLoading(false);

      if (isRevokePending) {
        setRevokePending(false);
        setRevokeError(true);
      } else if (isApprovePending) {
        setApprovePending(false);
        setApproveError(true);
      }
    }
  }, [isError]);

  useEffect(() => {
    const timerId = setInterval(async () => {
      const { data: newTxCount } = await refetch();

      if (txCount === undefined) {
        return;
      }

      if (newTxCount !== txCount) {
        setIsLoading(false);
        clearInterval(timerId);

        if (isRevokePending) {
          setRevokePending(false);
          setRevokeSuccess(true);
        } else if (isApprovePending) {
          setApprovePending(false);
          setApproveSuccess(true);
          setAllowanceChanged(true);
        }
      }
    }, 1_000);

    return () => clearInterval(timerId);
  }, [isApprovePending, isRevokePending, isError, isOpened]);

  return (
    <Dialog open={isOpened} onOpenChange={(open) => setOpened(open)}>
      <DialogContent className="border-none bg-[rgb(19,19,19)] sm:max-w-[425px]">
        <DialogHeader className="text-white gap-3">
          <DialogTitle className="text-center">Revoke & Approve</DialogTitle>

          <DialogDescription className="bg-amber-700/20 rounded-lg p-3 text-amber-700">
            The standard of the approval of the USDT token differs from the
            standard of ERC20 tokens, which is why in order to change the
            allowance, you need to make a revoke.
          </DialogDescription>
        </DialogHeader>

        <div className="my-5 flex flex-col gap-3 w-full">
          <CheckmarkText
            isError={isRevokeError}
            isPending={isRevokePending}
            isSuccess={isRevokeSuccess}
            text={"Revoke approval on your wallet"}
          />
          <CheckmarkText
            isError={isApproveError}
            isPending={isApprovePending}
            isSuccess={isApproveSuccess}
            text={"Sign approval message"}
          />
        </div>

        <DialogFooter>
          <Button
            disabled={isLoading}
            type="submit"
            onClick={() => {
              if (isRevokeSuccess && isApproveSuccess) {
                setOpened(false);
                return;
              }
              handleApproveUSDT(!isRevokeSuccess);
            }}
            className="outline-none w-full bg-[#ff00a6] rounded-lg text-[#330121] hover:bg-[#880357] text-xl font-bold"
          >
            {isLoading ? (
              <Spinner />
            ) : isRevokeSuccess && !isApproveSuccess ? (
              "Approve"
            ) : isApproveSuccess ? (
              "Close"
            ) : (
              "Revoke"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
