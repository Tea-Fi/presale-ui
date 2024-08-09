import React, { useEffect } from "react";
import { Button } from "../ui";

import Spinner from "../spinner";

import { EventLog } from "./common";

import { cn, parseHumanReadable } from "../../utils";
import { DAI, ETH, PRESALE_CLAIM_CONTRACT_ADDRESS, Referral, USDC, USDT, WBTC, WETH } from "../../utils/constants";
import { ClaimAmount, createClaim, CreateClaimDto, getClaimActivePeriod, getClaimForPeriod, getClaimProof } from "../../utils/claim";
import { useAccount, useChainId } from "wagmi";
import { toast } from "sonner";
import { wagmiConfig } from "../../config";
import { readContract, writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { PRESALE_CLAIM_EARNING_FEES_ABI } from "../../utils/claim_abi";

interface Props {
  tree: Referral;
  logs: EventLog[];

  address: string;
  disabled: boolean;

  claimed: ClaimAmount[];

  onClaim: () => void;
}

export const DashboardClaimButton: React.FC<Props> = (props) => {
  const chainId = useChainId();
  const account = useAccount();

  const [showConfirm, setConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
 
  const [canClaim, setCanClaim] = React.useState<boolean>(false);
  const [proof, setClaimProof] = React.useState<Awaited<ReturnType<typeof getClaimProof>>>()

  React.useEffect(() => {
  }, [])

  const tokenList = React.useMemo(() => ({
    [ETH[chainId].toLowerCase()]: { decimals: 18, symbol: "ETH" },
    [WETH[chainId].toLowerCase()]: { decimals: 18, symbol: "WETH" },
    [USDC[chainId].toLowerCase()]: { decimals: 6, symbol: 'USDC' },
    [USDT[chainId].toLowerCase()]: { decimals: 6, symbol: 'USDT' },
    [DAI[chainId].toLowerCase()]: { decimals: 18, symbol: 'DAI' },
    [WBTC[chainId].toLowerCase()]: { decimals: 8, symbol: 'WBTC' },
  }), [chainId]);

  const getProofAndCheck = React.useCallback(async () => {
    if (!account.address) {
      setCanClaim(false);
      return;
    }

    if (chainId === 1) {
      // toast.error('Claim is not yet available on Mainnet');
      setCanClaim(false);
      return;
    }

    const period = await getClaimActivePeriod(chainId.toString());

    if (!period) {
      setCanClaim(false);
      return;
    }

    const periodClaimes = await getClaimForPeriod(chainId.toString(), period.id, account.address);
   
    if (periodClaimes.length > 0) {
      setCanClaim(false);
      return;
    }

    const currentProof = await getClaimProof(chainId.toString(), account.address);
    
    if (!currentProof) {
      setCanClaim(false);
      return;
    }
    
    const canClaimFromContract = await readContract(wagmiConfig, {
      abi: PRESALE_CLAIM_EARNING_FEES_ABI,
      address: PRESALE_CLAIM_CONTRACT_ADDRESS[chainId] as `0x${string}`,
      args: [
        account.address,
        BigInt(currentProof.nonce),
        currentProof.tokens,
        currentProof.amounts.map(x => BigInt(x)),
        currentProof.proof
      ],
      functionName: 'isAccountAbleToClaim'
    }) as boolean;

    setCanClaim(canClaimFromContract);

    if (!canClaimFromContract) {
      return;
    }

    setTimeout(() => {
      getProofAndCheck()
    }, new Date(period.endDate).getTime() - Date.now())

    setClaimProof(currentProof);
  }, [account.address, chainId])

  useEffect(() => {
    getProofAndCheck();
  }, [getProofAndCheck])
  
  const toggleShowConfirm = React.useCallback(async () => {
    setConfirm(state => !state);
  }, [chainId, account.address])

  const isDisabled = React.useMemo(() => {
    return !canClaim ;
  }, [proof, props.disabled, props.address])
  
  const buttonStyles = React.useMemo(() => {
    if (isDisabled || !props.claimed) {
      return cn(
        'px-16 py-8 text-xl'
      );
    }

    return cn(
      'px-16 py-8 text-xl',
      'text-xl bg-[#f716a2] text-secondary-foreground',
      'hover:bg-[#3a0c2a] transition-none'
    );
  }, [isDisabled, props.claimed])

  const cancel = React.useCallback(() => {
    setConfirm(false)
  }, [])

  const claim = React.useCallback(async () => {
    if (!proof) {
      return;
    }

    try {
      setLoading(true)

      const hash = await writeContract(wagmiConfig, {
        abi: PRESALE_CLAIM_EARNING_FEES_ABI,
        address: PRESALE_CLAIM_CONTRACT_ADDRESS[chainId] as `0x${string}`,
        args: [
          BigInt(proof.nonce),
          proof.tokens,
          proof.amounts.map(x => BigInt(x)),
          proof.proof
        ],
        functionName: 'claim'
      });

      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });

      if (receipt?.status == "reverted") {
        toast.error("Failed to claim. Please try again");
       
        return;
      } 

      const values = {
        walletAddress: props.address,
        chainId: chainId.toString(),

        claims: proof.tokens.map((address, idx) => {
          const token = tokenList[address.toLowerCase()]!;

          return {
            token: token.symbol,
            tokenAddress: address,

            amount: proof.amounts[idx].toString(),
            amountUsd: proof.amountsUsd[idx].toString()
          };
        }),
      } as CreateClaimDto;
      

      if (receipt.status == "success") {
        await createClaim(values);

        toast.success(
          "Congratulations! Your earnings have been successfully claimed."
        );

        props.onClaim();
        setCanClaim(false)
      } 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setConfirm(false);
    }

  }, [props.address, proof, getProofAndCheck])


  return (
    <>
      <Button 
        disabled={isDisabled}
        className={buttonStyles}
        onClick={toggleShowConfirm}
      >
        Claim
      </Button>
      
      {showConfirm && (
        <div className="referral-form-backdrop">
          <article className="referral-form">
            <header>
              <div className="text-xl font-bold">
                Claim reward
              </div>
            </header>

            <main className="flex flex-col m-4 items-center">
              <div>
                Amount to claim:
              </div>

              <div className="text-lg font-light grid grid-cols-2 gap-x-4 gap-y-1">
                {proof?.tokens.map((x, idx) => {
                  const token = tokenList[x.toLowerCase()];
                  const amount = proof.amounts[idx];

                  return (
                    <React.Fragment key={`token-${token.symbol}`}>
                      <div className="place-self-end">
                        {token.symbol} 
                      </div>

                      <div className="place-self-start">
                        {parseHumanReadable(BigInt(amount), token.decimals, 6)}
                      </div>
                      
                      {/* <div className="place-self-start">
                        ~${parseHumanReadable(entry.amount.soldInUsd, 10, 2)}
                      </div> */}
                    </React.Fragment>
                  )
                })}
              </div>
            </main>

            <footer className="flex flex-row gap-2 bg-">
              <Button
                disabled={loading}
                onClick={claim}
                className={cn(
                  'grow grid place-content-center',
                  'bg-[#f716a2] text-secondary-foreground',
                  'hover:bg-[#3a0c2a] transition-none'
                )}
              >
                <>
                  {loading && <Spinner />} 
                  {!loading && 'Approve'}
                </>
              </Button>

              <Button onClick={cancel} className="grow">
                Cancel
              </Button>
            </footer>
          </article>
        </div>
      )}
    </>
  )

};
