import React from "react";
import { Button } from "../ui";

import Spinner from "../spinner";

import { calculateEarningByToken, EventLog } from "./common";

import { cn, parseHumanReadable } from "../../utils";
import { DAI, ETH, Referral, USDC, USDT, WBTC, WETH } from "../../utils/constants";
import { ClaimAmount, createClaim, CreateClaimDto, generateSignature } from "../../utils/claim";
import { useChainId, useSignMessage } from "wagmi";
import { toast } from "sonner";

interface Props {
  tree: Referral;
  logs: EventLog[];

  address: string;
  disabled: boolean;

  claimed: ClaimAmount[];

  onClaim: () => void;
}


export const DashboardClaimButton: React.FC<Props> = (props) => {
  const chainId = useChainId()

  const [showConfirm, setConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const { signMessageAsync } = useSignMessage();
  
  const tokenList = React.useMemo(() => ({
    [ETH[chainId].toLowerCase()]: { decimals: 18, symbol: "ETH" },
    [WETH[chainId].toLowerCase()]: { decimals: 18, symbol: "WETH" },
    [USDC[chainId].toLowerCase()]: { decimals: 6, symbol: 'USDC' },
    [USDT[chainId].toLowerCase()]: { decimals: 6, symbol: 'USDT' },
    [DAI[chainId].toLowerCase()]: { decimals: 18, symbol: 'DAI' },
    [WBTC[chainId].toLowerCase()]: { decimals: 8, symbol: 'WBTC' },
  }), [chainId]);
  
  const toggleShowConfirm = React.useCallback(() => {
    setConfirm(state => !state)
  }, [])
  
  const amount = React.useMemo(() => {
    if (!props.tree || !props.logs || !props.claimed) {
      return [];
    }

    const commission = calculateEarningByToken(props.tree, props.logs);

    const result = Object.entries(commission)
      .map(([address, stats]) => {
        const claimed = props.claimed
          .find(x => x.tokenAddress.toLowerCase() === address.toLowerCase())

        if (!claimed) {
          return { address, amount: stats };
        }
       
        return {
          address,
          amount: {
            purchases: stats.purchases,
            soldInUsd: stats.soldInUsd - BigInt(claimed.amountUsd),
            tokensSold: stats.tokensSold - BigInt(claimed.amount)
          }
        }
      })

    return result;
  }, [props.tree, props.logs, props.claimed])

  const isDisabled = React.useMemo(() => {
    return props.disabled || !props.address || !amount;
  }, [amount, props.disabled, props.address])
  
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

  const approveDisabled = React.useMemo(() => {
    return loading || amount.every(x => x.amount.tokensSold <= 0n);
  }, [loading, amount])
  
  const cancel = React.useCallback(() => {
    setConfirm(false)
  }, [])

  const claim = React.useCallback(async () => {
    if (!props.address || !amount) {
      return;
    }

    try {
      setLoading(true);

      const values = {
        walletAddress: props.address,
        chainId: chainId.toString(),

        claims: amount.map(entry => {
          const token = tokenList[entry.address.toLowerCase()]!;

          return {
            token: token.symbol,
            tokenAddress: entry.address,

            amount: entry.amount.tokensSold.toString(),
            amountUsd: entry.amount.soldInUsd.toString(),
          };
        }),
      } as CreateClaimDto;
      
      const signPayload = await generateSignature(props.address!, values);

      const signedMessage = await signMessageAsync({
        message: `0x${signPayload}`,
      });

      const payload = {
        ...values,
        signature: signedMessage,
        senderAddress: props.address!,
      };

      await createClaim(payload);

      props.onClaim()
      setConfirm(false)

      toast.success('Successfully claimed', {
        description: 'We will send your commission to your wallet soon!'
      });

    } catch (err) {
      toast.error(`Error occured, try again later`, {
        description: `${err}`
      });
    } finally {
      setLoading(false);
    }

  }, [amount, props.address])


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

              <div className="text-lg font-light grid grid-cols-3 gap-x-4 gap-y-1">
                {!amount.length && 'None'}

                {amount.map(entry => {
                  const token = tokenList[entry.address.toLowerCase()]!;

                  return (
                    <React.Fragment key={`token-${token.symbol}`}>
                      <div className="place-self-end">
                        {token.symbol} 
                      </div>

                      <div className="place-self-start">
                        {parseHumanReadable(entry.amount.tokensSold, token.decimals + 4, 6)}
                      </div>
                      
                      <div className="place-self-start">
                        ~${parseHumanReadable(entry.amount.soldInUsd, 10, 2)}
                      </div>
                    </React.Fragment>
                  )
                })}
              </div>
            </main>

            <footer className="flex flex-row gap-2 bg-">
              <Button
                disabled={approveDisabled}
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
