import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SlCard, SlSelect, SlOption, SlIcon, SlButton, SlAlert } from '@shoelace-style/shoelace/dist/react';
import bigDecimal from 'js-big-decimal';

import { ChainId, Token, CurrencyAmount } from '@uniswap/sdk-core';
import { Pair, Route } from '@uniswap/v2-sdk';
import { JsonRpcProvider, MaxUint256, ethers } from 'ethers';

import { PAIR_ABI } from '../utils/pair-abi';
import { useWalletContext } from '../context/wallet.context';
import tetherIcon from '../../assets/icons/tether.svg';
import usdcIcon from '../../assets/icons/usd-coin-usdc-logo.svg';
import wbtcIcon from '../../assets/icons/wbtc.svg';
import ethereumIcon from '../../assets/icons/ethereum.svg';
import { CoinInput } from '../components/coin-input';
import { TokenRate } from '../components/token-rate';
import teaLogo from '../../assets/icons/tea-logo.svg';
import { buyExactPresaleTokens, getOptionInfo } from '../utils/presale';
import { PRESALE_CONTRACT_ADDRESS, USDC, USDT, WBTC, WETH, investmentInfo } from '../utils/constants';
import Spinner from '../components/spinner';
// import { useEventContext } from '../context/event.context';
import { InvestmentOptions } from '../components/investment-options';
import { Contract } from 'ethers';
import { Address, erc20Abi } from 'viem';

export type CoinType = 'eth' | 'usdt' | 'usdc' | 'weth' | 'wbtc';
const coins: CoinType[] = ['usdt', 'weth', 'wbtc'];

export const Buy = () => {
  const eventModalRef = useRef<any>(null);
  const [selectedCoin, setSelectedCoin] = useState<CoinType>('usdt');
  const [amount, setAmount] = useState<string>();
  const [amountInTea, setAmountInTea] = useState<string>();
  const [eventTitle] = useState<string>('');
  const { paymentAssets, account, chainId } = useWalletContext();
  // const { showModal, setEventInfo } = useEventContext();
  const [submitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [investment, setInvestment] = useState('');

  const userTeaPurchased = useRef(0);
  const [price, setPrice] = useState(0);

  const mappedCoins = useMemo(
    () => ({
      eth: { icon: ethereumIcon, label: 'ETH', value: 'eth', contract: chainId ? WETH[chainId] : '' },
      usdt: { icon: tetherIcon, label: 'USDT', value: 'usdt', contract: chainId ? USDT[chainId] : '' },
      usdc: { icon: usdcIcon, label: 'USDC', value: 'usdc', contract: chainId ? USDC[chainId] : '' },
      weth: { icon: ethereumIcon, label: 'WETH', value: 'weth', contract: chainId ? WETH[chainId] : '' },
      wbtc: { icon: wbtcIcon, label: 'WBTC', value: 'wbtc', contract: chainId ? WBTC[chainId] : '' },
    }),
    [chainId]
  );


  useEffect(() => {
    const getBalances = async () => {
      const provider = ethers.getDefaultProvider(import.meta.env.VITE_PUBLIC_INFURA_URL);

      const token = new Contract(
        mappedCoins[selectedCoin].contract,
        erc20Abi,
        provider
      );
      const [balance, decimals] = await Promise.all([
        token.balanceOf(account),
        token.decimals(),
      ]);

      return [balance, decimals];

    }

    getBalances().then((args: any) => {
      paymentAssets[selectedCoin].balance = (Number(args[0]) / 10**Number(args[1])).toLocaleString();
      paymentAssets[selectedCoin].decimal = args[1].toString();
    });
  }, [selectedCoin]);

  const formattedBalance = useMemo(() => {
    if (!paymentAssets[selectedCoin]?.balance) {
      return '--';
    }
    return `Balance: ${paymentAssets[selectedCoin]?.balance} ${mappedCoins[selectedCoin]?.label}`;
  }, [paymentAssets, selectedCoin]);



  // const buyButtonDisabled = useMemo(() => {
  //   return (
  //     !amount ||
  //     !amountInTea ||
  //     paymentAssets[selectedCoin] === null ||
  //     loading ||
  //     submitting ||
  //     Number(amount) > Number(paymentAssets[selectedCoin]?.balance) ||
  //     remainingTea.current < +amountInTea
  //   );
  // }, [amount, paymentAssets, selectedCoin, amountInTea, submitting]);

  // const updateInfo = async () => {
  //   if (account) {
  //     // const result = await getOptionInfo();
  //     // remainingTea.current = result.roundSize - result.roundSold;
  //     // const userBalance = await getPresaleUserBalance(account);
  //     // userTeaPurchased.current = userBalance;
  //     updateUserBalance();
  //   }
  // };

  useEffect(() => {
    const handleStart = async () => {
      try {
        // const result = await getPresaleRoundSold();
        // remainingTea.current = result.roundSize - result.roundSold;
        // const userBalance = await getPresaleUserBalance(account as string);
        // userTeaPurchased.current = userBalance;
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    if (account) {
      handleStart();
    }
  }, [account]);

  const createPair = useCallback(async (first: Token, second: Token) => {
    const pairAddress = Pair.getAddress(first, second);

    const provider = new JsonRpcProvider(import.meta.env.VITE_PUBLIC_INFURA_URL);

    const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);

    const reserves = await pairContract['getReserves']();

    const [reserve0, reserve1] = reserves;

    const tokens = [first, second];
    const [token0, token1] = tokens[0].sortsBefore(tokens[1]) ? tokens : [tokens[1], tokens[0]];

    const pair = new Pair(
      CurrencyAmount.fromRawAmount(token0, Number(reserve0)),
      CurrencyAmount.fromRawAmount(token1, Number(reserve1))
    );

    return pair;
  }, []);

  useEffect(() => {
    if (account && selectedCoin) {
      const fetchPrice = async () => {
        try {
          if (['usdt', 'usdc'].includes(selectedCoin)) {
            setPrice(1);
            return;
          }
          const decimal = paymentAssets[selectedCoin]?.decimal || 18;
          const InputToken = new Token(
            chainId === 1 ? ChainId.MAINNET : ChainId.SEPOLIA,
            mappedCoins[selectedCoin].contract,
            decimal
          );
          const USDT = new Token(chainId === 1 ? ChainId.MAINNET : ChainId.SEPOLIA, mappedCoins.usdt.contract, 6);
          const pair = await createPair(InputToken, USDT);
          const route = new Route([pair], InputToken, USDT);
          const price = route.midPrice.toSignificant(6);

          setPrice(+price);
        } catch (error) {
          console.error(error);
        }
      };
      fetchPrice();
    }
  }, [account, selectedCoin]);

  useEffect(() => {
    if ([investment, price, amount, amountInTea].every((el) => Boolean(el))) {
      setAmountInTea(`${(+(amount || 0) * price) / +investment}`);
    }
  }, [investment, price, amount, amountInTea]);

  // const handleApprove = async () => {
  //   try {
  //     const decimal = paymentAssets[selectedCoin]?.decimal;
  //     if (!amount || !decimal) {
  //       return;
  //     }
  //     setEventTitle('Waiting For Transaction (1/3) Approval...');
  //     eventModalRef.current?.show();
  //     await setTokenApprove(mappedCoins[selectedCoin].contract, '0', decimal);
  //     setEventTitle('Waiting For Transaction (2/3) Approval...');
  //     await setTokenApprove(mappedCoins[selectedCoin].contract, amount, decimal);
  //     return true;
  //   } catch (err: any) {
  //     eventModalRef.current?.hide();
  //     let message = 'Transaction rejected.';
  //     if (err?.code == 'ACTION_REJECTED') {
  //       message = 'Transaction Rejected by user';
  //     }
  //     setEventInfo({
  //       title: 'Transaction Failed',
  //       subTitle: message,
  //     });
  //     showModal();
  //     return false;
  //   }
  // };

  // const enterPresale = async () => {
  //   try {
  //     if (!amount || !amountInTea || !paymentAssets[selectedCoin]?.decimal) {
  //       return;
  //     }
  //     setSubmitting(true);
  //     if (selectedCoin !== 'eth') {
  //       const approveResult = await handleApprove();
  //       if (!approveResult) {
  //         setSubmitting(false);
  //         return;
  //       }
  //     }
  //     setEventTitle('Waiting For Transaction (3/3) Approval...');
  //     eventModalRef.current?.show();
  //     const res = await enterPresaleUtil(
  //       amountInTea,
  //       Number(window.localStorage.getItem('referral')),
  //       mappedCoins[selectedCoin].contract
  //     );
  //     updateInfo();
  //     if (res.status === 'SUCCESS') {
  //       setEventTitle('Transaction Approved ✅');
  //       setTimeout(() => {
  //         eventModalRef.current?.hide();
  //       }, 4000);
  //     } else {
  //       eventModalRef.current?.hide();
  //       setEventInfo({
  //         title: 'Transaction Failed',
  //         subTitle: res.message,
  //       });
  //       showModal();
  //     }
  //     setSubmitting(false);
  //   } catch (err: any) {
  //     eventModalRef.current?.hide();
  //     setEventInfo({
  //       title: 'Transaction Failed',
  //       subTitle: err.message,
  //     });
  //     showModal();
  //     setSubmitting(false);
  //   }
  // };

  useEffect(() => {
    const handleOptionBalance = async () => {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const optionInfo = await getOptionInfo(investmentInfo[investment].id + 1);


      const teaToken = new Contract(
        optionInfo.presaleToken,
        erc20Abi,
        signer
      );

      
      userTeaPurchased.current = +(Number(await teaToken.balanceOf(account)) / 10e18).toFixed(2);

    }

    handleOptionBalance();
  }, [selectedCoin]);



  return (
    <div className="buy page">
      {loading ? (
        <div className="loading">
          <div className="loading__inner">
            <img src={teaLogo} alt="Tea" slot="prefix" className="loading__logo" />

            <Spinner />
          </div>
        </div>
      ) : (
        <>
          <div className="alert">
            <SlAlert variant={'primary'} ref={eventModalRef} className="alert__container">
              <SlIcon slot="icon" name="info-circle" />
              {eventTitle}
            </SlAlert>
          </div>
          {/* <Countdown roundInfo={roundInfo} isActive={isActive} setIsActive={setIsActive} /> */}
          <TokenRate />
          <InvestmentOptions value={investment} onChange={setInvestment} />
          {investment && (
            <div className="investment-info">
              <div className="label">{investmentInfo[investment].tge}</div>
              <div className="label">{investmentInfo[investment].vested}</div>
            </div>
          )}
          {/* <ContractInfo info={contractInfo} /> */}
          <SlCard className="card">
            <SlCard className="card__inner">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <SlSelect
                  size="large"
                  value={selectedCoin}
                  onSlInput={(e) => {
                    setSelectedCoin((e.target as HTMLSelectElement).value as CoinType);
                    setAmount('');
                    setAmountInTea('');
                  }}
                  className="select-coin"
                >
                  <img className="select-coin__icon" slot="prefix" src={mappedCoins[selectedCoin]?.icon} alt="Tether" />
                  {coins
                    .map((key) => mappedCoins[key])
                    .map(({ icon, label, value }) => (
                      <SlOption value={value} key={value}>
                        <img className="coin-icon" slot="prefix" src={icon} alt="Tether" />
                        {label}
                      </SlOption>
                    ))}
                </SlSelect>
                {price && <div style={{ fontSize: '12px' }}>~{price}$</div>}
              </div>
              <div className="amount">
                <small className="amount__balance">{formattedBalance}</small>
                <CoinInput
                  disabled={!investment}
                  value={bigDecimal.round(amount, paymentAssets[selectedCoin]?.decimal)}
                  onChangeValue={(value) => {
                    setAmount(value);
                    setAmountInTea(`${(+value * price) / +investment}`);
                  }}
                />
              </div>
              <SlIcon name="arrow-down-circle-fill" className="convert-icon" />
            </SlCard>
            <SlCard className="card__inner tea">
              <SlSelect size="large" value="tea" className="select-coin" disabled>
                <img src={teaLogo} alt="Tea" slot="prefix" className="select-coin__icon" />
                <SlOption value="tea">TEA</SlOption>
              </SlSelect>
              <div className="amount">
                <small className="amount__balance">
                  Amount Purchased: {userTeaPurchased.current.toLocaleString('en-US', { maximumFractionDigits: 4 })} TEA
                </small>

                <CoinInput
                  disabled={!investment}
                  value={bigDecimal.round(amountInTea, 4)}
                  onChangeValue={(value) => {
                    setAmount(`${(+value * +investment) / price}`);
                    setAmountInTea(value);
                  }}
                />
              </div>
            </SlCard>
          </SlCard>
          {/* <SlButton onClick={enterPresale} disabled={buyButtonDisabled} variant="primary" className="buy__btn">
            {submitting ? <Spinner /> : 'BUY TEA'}
          </SlButton> */}

          <SlButton onClick={async () => {
            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();

            const token = new Contract(
              mappedCoins[selectedCoin].contract,
              erc20Abi,
              signer
            );

            

            
            const presale = PRESALE_CONTRACT_ADDRESS[chainId ?? 1];
   
            if(await token.allowance(account, presale) === 0n) {
              const tx = await token.approve(
                presale, 
                MaxUint256,
              );

              await tx.wait();
            }

            const optionId = investmentInfo[investment].id + 1
            await buyExactPresaleTokens({
              optionId: optionId,
              referrerId: 0,
              tokenSell: mappedCoins[selectedCoin].contract as Address,
              buyAmount: BigInt(10e18),
            });

            const optionInfo = await getOptionInfo(optionId)

            const teaToken = new Contract(
              optionInfo.presaleToken,
              erc20Abi,
              signer
            );


            userTeaPurchased.current = +(Number(await teaToken.balanceOf(account)) / 10e18).toFixed(2);
          }} variant="primary" className="buy__btn">
            {submitting ? <Spinner /> : 'BUY TEA'}
          </SlButton>
          
        </>
      )}
    </div>
  );
};
