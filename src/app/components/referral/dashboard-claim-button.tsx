import React from "react";
import { Button } from "../ui";

import Spinner from "../spinner";

import { calculateCommission, StatsMap, usdFormatter } from "./common";

import { cn } from "../../utils";
import { Referral } from "../../utils/constants";
import { createClaim, generateSignature } from "../../utils/claim";
import { useSignMessage } from "wagmi";
import { toast } from "sonner";

interface Props {
  tree: Referral;
  address: string;
  disabled: boolean;

  claimed?: string;
  stats?: StatsMap;

  onClaim: () => void;
}


export const DashboardClaimButton: React.FC<Props> = (props) => {
  const [showConfirm, setConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const { signMessageAsync } = useSignMessage();

  
  const toggleShowConfirm = React.useCallback(() => {
    setConfirm(state => !state)
  }, [])
  
  const amount = React.useMemo(() => {
    if (!props.tree || !props.stats || !props.claimed) {
      return;
    }

    const commission = calculateCommission(props.tree, props.stats);

    return commission.soldInUsd - BigInt(props.claimed)
  }, [props.tree, props.stats, props.claimed])

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
        amount: amount.toString(),
      };
      
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

              <div className="text-4xl font-light">
                {amount === undefined && 'None'}
                {amount !== undefined && (
                  <div>
                    {`$${usdFormatter.format(Number((amount) / BigInt(1e4)) / 100)}`}
                  </div>
                )}
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
