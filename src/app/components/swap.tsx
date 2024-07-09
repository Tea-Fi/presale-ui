import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Avatar, AvatarImage, Button, Input } from "../components/ui";
import { TeaTokenLogoAsset } from "../../assets/icons";
import { ArrowDownUpIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn, parseHumanReadable } from "../utils";
import {
  getBalance,
  getAccount,
  getChainId,
  waitForTransactionReceipt,
} from "@wagmi/core";

import { Token, wagmiConfig } from "../config";
import { Address, erc20Abi, maxUint256, parseUnits, zeroAddress } from "viem";
import {
  getInputPriceQuote,
  getOptionInfo,
  getSaleOptionsCout,
  getTokensAvailable,
} from "../utils/presale";
import { PRESALE_CONTRACT_ADDRESS, investmentInfo } from "../utils/constants";
import { useReadContract } from "wagmi";
import { readContract, writeContract } from "@wagmi/core";
import Spinner from "./spinner";
import { PRESALE_ABI } from "../utils/presale_abi";
import { toast } from "react-toastify";

export const SwapContainer = ({ tokenList }: { tokenList: Token[] }) => {
  const search = window.location.search;
  const urlParams = new URLSearchParams(search);
  const investment = urlParams.get("opt") || Object.keys(investmentInfo)[0];
  const referrerId = Number(window.localStorage.getItem("referral") || "0");

  const [isReversed, setReversed] = useState<boolean>(true);
  const [balance, setBalance] = useState<string | number>(0);
  const [restTeaBalance, setRestTeaBalance] = useState<string | number>(0);
  const [tokenSellValue, setTokenSellValue] = useState<string | number>("");
  const [tokenBuyValue, setTokenBuyValue] = useState<string | number>("");

  const [isTypingForTokenBuy, setIsTypingForTokenBuy] =
    useState<boolean>(false);
  const [isTypingForTokenSell, setIsTypingForTokenSell] =
    useState<boolean>(false);

  const [teaBalance, setTeaBalance] = useState<string | number>(0);

  const [selectedToken, setSelectedToken] = useState<Token>(tokenList[0]);
  const [selectedTokenPrice, setSelectedTokenPrice] = useState<string | number>(
    0
  );

  const [tokenIsApproved, setTokenIsApproved] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [balanceIsSufficient, setBalanceIsSufficient] =
    useState<boolean>(false);

  const [teaIsSufficient, setTeaIsSufficient] = useState<boolean>(false);

  const searchTimeout = useRef<NodeJS.Timeout>();

  const account = getAccount(wagmiConfig);
  const chainId = getChainId(wagmiConfig);

  const allowances = useReadContract({
    abi: erc20Abi,
    config: wagmiConfig,
    address: selectedToken.address,
    args: [
      account.address as Address,
      PRESALE_CONTRACT_ADDRESS[chainId] as Address,
    ],
    functionName: "allowance",
  });

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const investmentIndex = Object.keys(investmentInfo).findIndex(
          (key) => key === investment
        );

        const [total, option, optionsCount] = await Promise.all([
          getTokensAvailable(),
          getOptionInfo(investmentIndex),
          getSaleOptionsCout(),
        ]);
        const sold = option.sold;
        const rest = total / optionsCount - sold;
        setRestTeaBalance(parseHumanReadable(rest, 18, 3));
      } catch (error) {
        console.error(error);
      }
    };
    if (investment && investment) {
      fetchBalance();
    }
  }, [investmentInfo, investment]);

  const approveToken = async (token: Address) => {
    try {
      setIsLoading(true);
      const hash = await writeContract(wagmiConfig, {
        address: token,
        abi: erc20Abi,
        functionName: "approve",
        args: [PRESALE_CONTRACT_ADDRESS[chainId] as Address, maxUint256],
      });

      if (hash == undefined) {
        setIsLoading(false);
        return {
          status: "ERROR",
          message: "Operation cancelled by user",
          txid: null,
        };
      }

      const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });

      if (transactionReceipt.status == "success") {
        setTokenIsApproved(true);
        return {
          status: "SUCCESS",
          message: "Allowance successfully set",
          txid: hash,
        };
      }

      return {
        status: "ERROR",
        message: "Error setting allowance",
        txid: null,
      };
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("log => isLoading", isLoading);

  const handleBuy = async (token: Address, value: string) => {
    try {
      console.info("optionId", investmentInfo[investment].id);
      console.info("referrerId", referrerId);
      console.info("tokenSell", token);
      console.info("buyAmountHuman", value);

      if (referrerId <= 0) {
        return toast.error(
          "Unable to use Referral ID, please clear browser cache and reload the page to re-enter the referral code again.",
          {}
        );
      }

      setIsLoading(true);
      const chainId = getChainId(wagmiConfig);
      const buyAmount = parseUnits(value, 18);
      let hash;
      let txReceipt;

      if (!token || token === zeroAddress) {
        const amountInETH = await readContract(wagmiConfig, {
          abi: PRESALE_ABI,
          address: PRESALE_CONTRACT_ADDRESS[chainId] as Address,
          args: [investmentInfo[investment].id, token, buyAmount],
          functionName: "getExactPayAmount",
        });

        hash = await writeContract(wagmiConfig, {
          abi: PRESALE_ABI,
          address: PRESALE_CONTRACT_ADDRESS[chainId] as Address,
          args: [investmentInfo[investment].id, referrerId, buyAmount],
          value: amountInETH as bigint,
          functionName: "buyExactPresaleTokensETH",
        });
      } else {
        hash = await writeContract(wagmiConfig, {
          abi: PRESALE_ABI,
          address: PRESALE_CONTRACT_ADDRESS[chainId] as Address,
          args: [investmentInfo[investment].id, referrerId, token, buyAmount],
          functionName: "buyExactPresaleTokens",
        });
      }

      txReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });

      if (txReceipt.status == "success") {
        getTeaBalance().then((res) =>
          setTeaBalance(parseHumanReadable(res.value, res.decimals, 3))
        );
        setTokenBuyValue("");
        setTokenSellValue("");
        toast.success(
          "Congratulations! Your tokens have been successfully purchased."
        );
      } else if (txReceipt?.status == "reverted") {
        toast.error("Failed to buy. Please try again");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedTokenBalance = async () => {
    if (!account.address) return { value: 0n, decimals: 18 };
    const balance = await getBalance(wagmiConfig, {
      address: account.address ?? zeroAddress,
      token:
        selectedToken.address === zeroAddress
          ? undefined
          : selectedToken.address,
    });

    return balance;
  };

  const getSelectedTokenPrice = async () => {
    if (
      selectedToken.symbol == "USDC" ||
      selectedToken.symbol == "USDT" ||
      selectedToken.symbol == "DAI"
    ) {
      return 1;
    }

    const price = await getInputPriceQuote(
      selectedToken.address,
      BigInt(10 ** selectedToken.decimals)
    );

    return parseHumanReadable(price, 6, 2);
  };

  const getTeaBalance = async () => {
    if (!account.address) return { value: 0n, decimals: 18 };
    const optionInfo = await getOptionInfo(investmentInfo[investment].id);
    const teaToken = optionInfo.presaleToken;

    const balance = await getBalance(wagmiConfig, {
      address: account.address ?? zeroAddress,
      token: teaToken,
    });

    return balance;
  };

  const checkTokenAllowance = async () => {
    if (selectedToken.address == zeroAddress) {
      setTokenIsApproved(true);
      return;
    }

    const inputValue = parseUnits(
      tokenSellValue.toString(),
      selectedToken.decimals
    );
    const allowance = allowances.data ?? 0n;

    if (allowance == 0n || inputValue > allowance) {
      setTokenIsApproved(false);
      return;
    }

    setTokenIsApproved(true);
  };

  useEffect(() => {
    const value = parseUnits(tokenSellValue.toString(), selectedToken.decimals);
    const balanceValue = parseUnits(balance.toString(), selectedToken.decimals);

    setBalanceIsSufficient(value <= balanceValue);
  }, [tokenSellValue, balance]);

  useEffect(() => {
    const teaValue = parseUnits(tokenBuyValue.toString(), 18);
    const teaBalance = parseUnits(restTeaBalance.toString(), 18);

    setTeaIsSufficient(teaValue <= teaBalance);
  }, [restTeaBalance, tokenBuyValue]);

  setTeaIsSufficient;

  useEffect(() => {
    checkTokenAllowance();
  }, [allowances]);

  useEffect(() => {
    allowances.refetch();
  }, [tokenIsApproved]);

  useEffect(() => {
    allowances.refetch();

    // reset states...
    setIsTypingForTokenSell(false);
    setIsTypingForTokenBuy(false);
    setTokenBuyValue("");
    setTokenSellValue("");
    setSelectedTokenPrice("");

    getSelectedTokenPrice().then((res) => {
      setSelectedTokenPrice(res);
    });

    getTeaBalance().then((res) =>
      setTeaBalance(parseHumanReadable(res.value, res.decimals, 3))
    );

    getSelectedTokenBalance().then((res) => {
      setBalance(parseHumanReadable(res.value, res.decimals, 8));
      setBalanceIsSufficient(
        res.value <
          parseUnits(tokenSellValue.toString(), selectedToken.decimals)
      );
    });
  }, [selectedToken, account?.address]);

  const onCurrencyAmountChange = async (value: string) => {
    try {
      setIsTypingForTokenSell(true);
      if (isTypingForTokenBuy == true) {
        setIsTypingForTokenBuy(false);
      }

      if (value.length == 0 || value == "0") {
        setTokenBuyValue("");
        return;
      }

      const amountsOut = await readContract(wagmiConfig, {
        abi: PRESALE_ABI,
        address: PRESALE_CONTRACT_ADDRESS[chainId] as Address,
        args: [
          investmentInfo[investment].id,
          selectedToken.address,
          parseUnits(value, selectedToken.decimals),
        ],
        functionName: "getExactReceiveAmount",
      });

      setTokenBuyValue(parseHumanReadable(amountsOut as bigint, 18, 6));
    } catch (error) {
      console.error(error);
    }
  };

  const onTeaAmountChange = async (value: string) => {
    try {
      setIsTypingForTokenBuy(true);
      if (isTypingForTokenSell == true) {
        setIsTypingForTokenSell(false);
      }

      if (value.length == 0 || value == "0") {
        setTokenSellValue("");
        return;
      }

      const amountsIn = await readContract(wagmiConfig, {
        abi: PRESALE_ABI,
        address: PRESALE_CONTRACT_ADDRESS[chainId] as Address,
        args: [
          investmentInfo[investment].id,
          selectedToken.address,
          parseUnits(value, 18),
        ],
        functionName: "getExactPayAmount",
      });

      setTokenSellValue(
        parseHumanReadable(amountsIn as bigint, selectedToken.decimals, 6)
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-2 rounded-xl max-w-[480px] w-[480px] h-auto bg-[rgb(19,19,19)]">
      <div className="flex flex-col mb-2">
        <span className="text-zinc-400 text-xl font-bold">
          TEA price ${investment}
        </span>
        <span className="text-zinc-500 text-base">
          {investmentInfo[investment].tge}
        </span>
        <span className="text-zinc-500 text-base">
          {investmentInfo[investment].vested}
        </span>
      </div>

      <div
        className={cn(
          "relative flex gap-2",
          !isReversed ? "flex-col-reverse" : "flex-col"
        )}
      >
        <SwapInput
          disabled={isLoading || selectedTokenPrice == "" || !isReversed}
          title=""
          balance={balance}
          value={tokenSellValue}
          tokenList={tokenList}
          defaultValue={"ETH"}
          onChange={(value: string) => {
            const token = tokenList.find((token) => token.symbol === value);
            setSelectedToken(token ?? tokenList[0]);
          }}
          onType={(e) => {
            clearTimeout(searchTimeout.current);
            searchTimeout.current = setTimeout(
              () => onCurrencyAmountChange(e.target.value),
              500
            );
            setTokenSellValue(e.target.value);
          }}
        />

        <Button
          onClick={() => setReversed(!isReversed)}
          className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 outline outline-[6px] outline-[rgb(19,19,19)] bg-[rgb(27,27,27)] hover:bg-[rgb(25,25,25)]"
        >
          <ArrowDownUpIcon className="text-zinc-400" />
        </Button>

        <SwapInput
          disabled={isLoading || selectedTokenPrice == "" || isReversed}
          title=""
          balance={teaBalance}
          value={tokenBuyValue}
          isTea
          onType={(e) => {
            clearTimeout(searchTimeout.current);
            searchTimeout.current = setTimeout(
              () => onTeaAmountChange(e.target.value),
              500
            );
            setTokenBuyValue(e.target.value);
          }}
        />
      </div>

      <Button
        disabled={
          isLoading ||
          selectedTokenPrice == "" ||
          tokenBuyValue.toString() == "" ||
          tokenBuyValue.toString() == "0" ||
          !balanceIsSufficient ||
          !teaIsSufficient
        }
        onClick={async () => {
          if (!tokenIsApproved) {
            await approveToken(selectedToken.address);
          } else {
            await handleBuy(selectedToken.address, tokenBuyValue.toString());
            setTokenIsApproved(false);
          }
        }}
        className="bg-[#680043] hover:bg-[#aa006f] text-xl font-bold text-[#ff00a6] py-6"
      >
        {isLoading ? (
          <Spinner />
        ) : !balanceIsSufficient ? (
          "Insufficient funds"
        ) : !teaIsSufficient ? (
          "Insufficient TEA tokens"
        ) : tokenIsApproved ? (
          "Buy"
        ) : (
          `Allow ${selectedToken.symbol}`
        )}
      </Button>

      <div className="text-right text-zinc-500">
        {selectedTokenPrice == "" ? (
          <Spinner />
        ) : (
          <span>
            {selectedToken.symbol} price: ${selectedTokenPrice}
          </span>
        )}
      </div>
    </div>
  );
};

const SwapInput = ({
  disabled,
  title,
  balance,
  isTea,
  tokenList,
  defaultValue,
  value,
  onChange,
  onType,
}: {
  disabled?: boolean;
  title?: string;
  defaultValue?: string;
  tokenList?: Token[];
  value?: string | number;
  balance?: number | string;
  isTea?: boolean;
  onChange?: (value: string) => void;
  onType?: (param: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div className="w-full rounded-lg h-24 px-4 py-3 bg-[rgb(27,27,27)]">
      <div className="inline-flex justify-between w-full items-start">
        <span className="text-zinc-400">{title}</span>
        <span className="text-zinc-500 text-sm">Balance: {balance ?? 0}</span>
      </div>

      <div className="inline-flex gap-2 w-full h-10">
        <Input
          min="0"
          disabled={disabled}
          value={value}
          onKeyDown={(e: any) => {
            const prevVals = e.target.value;
            const value = e.key;
            const pattern = /^[\d]\d*\.?\d*$/;
            const isPatternTested = pattern.test(prevVals + value);

            if (
              !isPatternTested &&
              value !== "Backspace" &&
              value !== "ArrowLeft" &&
              value !== "ArrowRight" &&
              value !== "ArrowDown" &&
              value !== "ArrowUp"
            ) {
              e.preventDefault();
            }
          }}
          type="number"
          inputMode="decimal"
          onChange={onType}
          placeholder="0"
          className="bg-transparent text-3xl px-0 text-zinc-300 placeholder:text-zinc-600 h-full"
        />

        {isTea ? (
          <div className="inline-flex gap-3 items-center rounded-full bg-[rgb(19,19,19)] h-full px-2 w-44 text-zinc-400">
            <Item isTea />
          </div>
        ) : (
          <SelectContainer
            // disabled={disabled}
            defaultValue={defaultValue}
            onChange={onChange}
            items={tokenList}
          />
        )}
      </div>
    </div>
  );
};

const SelectContainer = ({
  items,
  defaultValue,
  onChange,
  disabled,
}: {
  items?: Token[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) => {
  return (
    <Select
      disabled={disabled}
      onValueChange={onChange}
      defaultValue={defaultValue}
    >
      <SelectTrigger className="inline-flex gap-3 items-center rounded-full bg-[rgb(19,19,19)] h-full px-2 w-44 text-zinc-400">
        <SelectValue placeholder="Select token" />
      </SelectTrigger>

      <SelectContent className="bg-[rgb(19,19,19)]">
        <SelectGroup>
          {items ? (
            items.map((item, index) => (
              <SelectItem
                key={index}
                value={item.symbol}
                className="hover:bg-[rgb(27,27,27)] focus:bg-[rgb(27,27,27)]"
              >
                <Item url={item.imageUrl} value={item.symbol} />
              </SelectItem>
            ))
          ) : (
            <></>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

const Item = ({
  value,
  url,
  isTea,
}: {
  value?: string;
  url?: string;
  isTea?: boolean;
}) => {
  return (
    <div className="inline-flex gap-3 items-center rounded-full bg-[rgb(19,19,19)] h-full px-2">
      {isTea ? (
        <span>
          <TeaTokenLogoAsset className="rounded-full size-6" />
        </span>
      ) : (
        <Avatar className="items-center justify-center w-auto">
          <AvatarImage className={"size-6"} src={url ?? ""} alt={value ?? ""} />
        </Avatar>
      )}
      <span className="text-zinc-400 font-semibold">
        {isTea ? "TEA" : value ?? ""}
      </span>
    </div>
  );
};
