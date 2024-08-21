import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { FunctionComponent, ReactNode } from "react";
import { useConnections, useConnectorClient, useDisconnect } from "wagmi";
import { useModal } from "connectkit";
import { JsonRpcProvider, ethers } from "ethers";

import { ERC20_ABI } from "../utils/erc20_abi";
import { USDT, USDC, WETH, WBTC } from "../utils/constants";
import { SUPPORTED_NETWORK } from "../config";
import { useAccountStore } from "../state/user.store";

export enum WalletEvents {
  REQUEST_ACCOUNTS = "eth_requestAccounts",
  ACCOUNTS = "eth_accounts",
  ACCOUNTS_CHANGED = "accountsChanged",
  GET_BALANCE = "eth_getBalance",
}

enum WalletStatus {
  CONNECTED = "connected",
  CONNECTING = "connecting",
  DISCONNECTED = "disconnected",
  DISCONNECTING = "disconnecting",
}

export interface WalletContext {
  account: string | null;
  chainId: number | null;
  status: WalletStatus;
  connect: () => void;
  disconnect: () => void;
  updateUserBalance: () => void;
  paymentAssets: any;
  unsupportedChain: boolean;
}

interface Currency {
  balance: string | null;
  decimal: number;
}

const METAMASK_ACCOUNT_LOCALSTORAGE_KEY = "metamask_account";
export const WalletContext = createContext<WalletContext | null>(null);

const initialValues = {
  account: null,
  status: WalletStatus.DISCONNECTED,
};

type ContextValues = typeof initialValues;

const defaultCurrencies = {
  eth: { balance: null, decimal: 18 },
  usdt: { balance: null, decimal: 6 },
  usdc: { balance: null, decimal: 6 },
  weth: { balance: null, decimal: 18 },
  wbtc: { balance: null, decimal: 8 },
};

export const WalletProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const { open, setOpen } = useModal();
  const { data } = useConnectorClient();
  const connections = useConnections();
  const accountStore = useAccountStore();
  const { disconnect: fullDisconnect } = useDisconnect();

  const [values, setValues] =
    useState<Pick<WalletContext, keyof ContextValues>>(initValues());

  const [currenciesInfo, setCurrenciesInfo] =
    useState<Record<string, Currency>>(defaultCurrencies);

  const account = useMemo(() => data?.account?.address || null, [data]);
  const chainId = useMemo(() => data?.chain?.id || null, [data]);

  //need to full disconnect because sometimes we get 2 connections instead of 1
  useEffect(() => {
    if (accountStore.account?.isDisconnected && connections?.length) {
      connections.forEach(({ connector }) => {
        fullDisconnect({ connector });
      });
    }
  }, [connections]);

  function initValues() {
    const storedValues = window.localStorage.getItem(
      METAMASK_ACCOUNT_LOCALSTORAGE_KEY,
    );
    if (storedValues) {
      return JSON.parse(storedValues);
    }
    return initialValues;
  }

  const _getBalance = useCallback(
    async (address: string) => {
      try {
        if (!chainId) return;
        const provider = new JsonRpcProvider(
          import.meta.env.VITE_PUBLIC_INFURA_URL,
        );

        const [ethBalance, usdtBalance, usdcBalance, wethBalance, wbtcBalance] =
          await Promise.all([
            provider?.getBalance(address),
            getFormattedBalanceOfErc20TokenHolder(
              USDT[chainId],
              address,
              currenciesInfo.usdt.decimal,
            ),
            getFormattedBalanceOfErc20TokenHolder(
              USDC[chainId],
              address,
              currenciesInfo.usdc.decimal,
            ),
            getFormattedBalanceOfErc20TokenHolder(
              WETH[chainId],
              address,
              currenciesInfo.weth.decimal,
            ),
            getFormattedBalanceOfErc20TokenHolder(
              WBTC[chainId],
              address,
              currenciesInfo.wbtc.decimal,
            ),
          ]);

        setCurrenciesInfo({
          eth: {
            balance: ethBalance ? ethers.formatUnits(ethBalance) : "0",
            decimal: 18,
          },
          usdt: {
            balance: usdtBalance.toLocaleString("en-US", {
              maximumFractionDigits: 4,
            }),
            decimal: 6,
          },
          usdc: {
            balance: usdcBalance.toLocaleString("en-US", {
              maximumFractionDigits: 4,
            }),
            decimal: 6,
          },
          weth: {
            balance: wethBalance.toLocaleString("en-US", {
              maximumFractionDigits: 4,
            }),
            decimal: 18,
          },
          wbtc: {
            balance: wbtcBalance.toLocaleString("en-US", {
              maximumFractionDigits: 4,
            }),
            decimal: 8,
          },
        });
      } catch (err) {
        console.error("==>", err);
      }
    },
    [chainId],
  );

  const updateUserBalance = useCallback(async () => {
    if (account && chainId) {
      _getBalance(account);
    }
  }, [account, chainId]);

  useEffect(() => {
    if (account && chainId) {
      _getBalance(account);
      setValues((values) => ({
        ...values,
        account: account,
        status: WalletStatus.CONNECTED,
      }));
    } else {
      setValues((values) => ({
        ...values,
        account: null,
        status: WalletStatus.DISCONNECTED,
      }));
    }
  }, [account, chainId]);

  const connect = useCallback(() => {
    if (open) {
      setOpen(true);
    }
  }, [open]);

  const disconnect = useCallback(() => {
    setCurrenciesInfo(defaultCurrencies);
    setValues((values) => ({
      ...values,
      account: null,
      status: WalletStatus.DISCONNECTED,
    }));
  }, []);

  // async function getFormattedDecimalOfErc20TokenHolder(contractAddress: string) {
  //   // updated provider with custom url for better testnet experience
  //   const provider = new JsonRpcProvider(import.meta.env.VITE_PUBLIC_INFURA_URL);
  //   const usdtErc20Contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);

  //   const numDecimals = await usdtErc20Contract.decimals();

  //   return numDecimals;
  // }

  async function getFormattedBalanceOfErc20TokenHolder(
    contractAddress: string,
    address: string,
    numDecimals: number,
  ) {
    // updated provider with custom url for better testnet experience
    const provider = new JsonRpcProvider(
      import.meta.env.VITE_PUBLIC_INFURA_URL,
    );
    const usdtErc20Contract = new ethers.Contract(
      contractAddress,
      ERC20_ABI,
      provider,
    );

    try {
      const balance = await usdtErc20Contract.balanceOf(address);
      return Number(ethers.formatUnits(balance, numDecimals));
    } catch (_) {
      return 0;
    }
  }

  // const initAccountsListener = useCallback(() => {
  //   const ethereum = ethereumRef.current.getProvider();
  //   if (!ethereum?.isConnected()) setTimeout(initAccountsListener, 500);

  //   /* Register listener for account changes */
  //   ethereum?.on(WalletEvents.ACCOUNTS_CHANGED, onAccountsChanged);

  //   /* Request account unless a connecting process is pending or is in a disconnected state */
  //   if (values.status !== WalletStatus.CONNECTING && values.status !== WalletStatus.DISCONNECTED) {
  //     ethereum?.request({ method: WalletEvents.ACCOUNTS }).then(onAccountsChanged).catch(onAccountsError);
  //   }
  // }, [onAccountsChanged, onAccountsError, values.status]);

  // useEffect(() => {
  //   let ethereum: SDKProvider;

  //   setTimeout(initAccountsListener, 500);

  //   return () => {
  //     ethereum?.removeAllListeners(WalletEvents.ACCOUNTS_CHANGED);
  //   };
  // }, [initAccountsListener, onAccountsChanged, onAccountsError]);

  useEffect(() => {
    window.localStorage.setItem(
      METAMASK_ACCOUNT_LOCALSTORAGE_KEY,
      JSON.stringify(values),
    );
  }, [values]);

  useEffect(() => {
    setValues((state) => ({ ...state, chainId }));
  }, [chainId]);

  useEffect(() => {
    setValues((state) => ({ ...state, account }));
  }, [account]);

  const unsupportedChain = useMemo(
    () =>
      connections[0] && chainId
        ? `${connections[0].chainId}` !== SUPPORTED_NETWORK
        : false,
    [connections, chainId, SUPPORTED_NETWORK],
  );

  return (
    <WalletContext.Provider
      value={{
        ...values,
        account,
        chainId,
        unsupportedChain,
        connect,
        disconnect,
        updateUserBalance,
        paymentAssets: currenciesInfo,
      }}
      children={children}
    />
  );
};

export const useWalletContext = (): WalletContext => {
  const contextValue = useContext(WalletContext);
  if (!contextValue) {
    throw new Error("Tried to use template context from outside the provider");
  }
  return contextValue;
};
