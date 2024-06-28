import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { SlCard, SlSelect, SlOption, SlIcon, SlButton, SlAlert } from '@shoelace-style/shoelace/dist/react';
import bigDecimal from 'js-big-decimal';

// import { Token, CurrencyAmount } from '@uniswap/sdk-core';
// import { Pair } from '@uniswap/v2-sdk';
import { MaxUint256, ZeroAddress, ethers } from 'ethers';

// import { PAIR_ABI } from '../utils/pair-abi';
import { useWalletContext } from '../context/wallet.context';
import tetherIcon from '../../assets/icons/tether.svg';
import usdcIcon from '../../assets/icons/usd-coin-usdc-logo.svg';
import wbtcIcon from '../../assets/icons/wbtc.svg';
import ethereumIcon from '../../assets/icons/ethereum.svg';
import { CoinInput } from '../components/coin-input';
import { TokenRate } from '../components/token-rate';
import teaLogo from '../../assets/icons/tea-logo.svg';
import { buyExactPresaleTokens, getInputPriceQuote, getOptionInfo, getQuoteAmountsInForTeaTokens, getQuoteAmountsOutForTeaTokens } from '../utils/presale';
import { PRESALE_CONTRACT_ADDRESS, USDC, USDT, WBTC, WETH, investmentInfo } from '../utils/constants';
import Spinner from '../components/spinner';
import { useEventContext } from '../context/event.context';
import { InvestmentOptions } from '../components/investment-options';
import { Contract } from 'ethers';
import { Address, erc20Abi } from 'viem';

export type CoinType = 'eth' | 'usdt' | 'usdc' | 'weth' | 'wbtc';
const coins: CoinType[] = ['eth', 'usdc', 'usdt', 'weth', 'wbtc'];

export const Buy = () => {
  const eventModalRef = useRef<any>(null);
  const [selectedCoin, setSelectedCoin] = useState<CoinType>('usdt');
  const [selectedCoinIsAllowed, setSelectedCoinIsAllowed] = useState(false);
  const [amount, setAmount] = useState<string>();
  const [amountInTea, setAmountInTea] = useState<string>();
  const [eventTitle, setEventTitle] = useState<string>('');
  const { paymentAssets, account, chainId } = useWalletContext();
  const { showModal, setEventInfo } = useEventContext();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [investment, setInvestment] = useState(Object.keys(investmentInfo)[0]);

  const userTeaPurchased = useRef(0);
  const [price, setPrice] = useState(0);

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const mappedCoins = useMemo(
    () => ({
      eth: { icon: ethereumIcon, label: 'ETH', value: 'eth', contract: chainId ? ZeroAddress : ZeroAddress },
      usdt: { icon: tetherIcon, label: 'USDT', value: 'usdt', contract: chainId ? USDT[chainId] : '' },
      usdc: { icon: usdcIcon, label: 'USDC', value: 'usdc', contract: chainId ? USDC[chainId] : '' },
      weth: { icon: ethereumIcon, label: 'WETH', value: 'weth', contract: chainId ? WETH[chainId] : '' },
      wbtc: { icon: wbtcIcon, label: 'WBTC', value: 'wbtc', contract: chainId ? WBTC[chainId] : '' },
    }),
    [chainId]
  );


  useEffect(() => {
    if (account == null) return;

    const provider = ethers.getDefaultProvider(import.meta.env.VITE_PUBLIC_INFURA_URL);
    const getBalance = async () => {
      if (selectedCoin == 'eth') {
        setSelectedCoinIsAllowed(true);
        return [await provider.getBalance(account), 18];
      }

      const token = new Contract(
        mappedCoins[selectedCoin].contract,
        erc20Abi,
        provider
      );
      const presale = PRESALE_CONTRACT_ADDRESS[chainId ?? 1];
      setSelectedCoinIsAllowed(await token.allowance(account, presale) > 0);

      const [balance, decimals] = await Promise.all([
        token.balanceOf(account),
        token.decimals(),
      ]);
      return [balance, decimals];
    }

    getBalance().then((args: any) => {
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

  const handleOptionBalance = async () => {
    if (investment == undefined || investmentInfo[investment] == undefined) return;

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const optionInfo = await getOptionInfo(investmentInfo[investment].id);

    const teaToken = new Contract(
      optionInfo.presaleToken,
      erc20Abi,
      signer
    );

    userTeaPurchased.current = +(Number(await teaToken.balanceOf(account)) / 1e18).toFixed(2);
    forceUpdate();
  }

  const buyButtonDisabled = useMemo(() => {
    return (
      !amount ||
      !amountInTea ||
      paymentAssets[selectedCoin] === null ||
      loading ||
      submitting ||
      Number(amount) > Number(paymentAssets[selectedCoin]?.balance)
    );
  }, [amount, paymentAssets, selectedCoin, amountInTea, submitting]);

  useEffect(() => {
    if (account) {
      setLoading(false);
      handleOptionBalance();
    }
  }, [account]);

  useEffect(() => {
    if (account && selectedCoin) {
      const fetchPrice = async () => {
        try {
          if (['usdt', 'usdc'].includes(selectedCoin)) {
            setPrice(1);
            return;
          }
          const decimal = paymentAssets[selectedCoin]?.decimal || 18;
          const tokenPrice = await getInputPriceQuote(
            mappedCoins[selectedCoin].contract as Address,
            BigInt(10**decimal)
          );
          const priceToHuman = Number(tokenPrice) / 10**6;
          setPrice(Number(priceToHuman.toFixed(2)));
        } catch (error) {
          setEventInfo({
            title: 'Initialization Error!',
            subTitle: 'Unable to obtain ' + selectedCoin.toUpperCase() + ' price...',
          });
          showModal();
        }
      };
      fetchPrice();
    }
  }, [account, selectedCoin]);

  const enterPresale = async () => {
    if (amountInTea == undefined) return false;
    setSubmitting(true);

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const presale = PRESALE_CONTRACT_ADDRESS[chainId ?? 1];

    if(selectedCoin !== 'eth') {
      const token = new Contract(
        mappedCoins[selectedCoin].contract,
        erc20Abi,
        signer
      );


      // check alloance status and aprove tokens
      if (await token.allowance(account, presale) === 0n) {
        setEventTitle('Allow spending ' + selectedCoin.toUpperCase());
        eventModalRef.current?.show();
        
        try {
          const tx = await token.approve(
            presale, 
            MaxUint256,
          );
          await tx.wait();
        } catch (err: any) {
          eventModalRef.current?.hide();
          setSubmitting(false);
          let message = 'Transaction rejected.';
          if (err?.code == 'ACTION_REJECTED') {
            message = 'Transaction Rejected by user';
          }
          setEventInfo({
            title: 'Transaction Failed',
            subTitle: message,
          });
          showModal();
          return false; // cancel operation
        }
        eventModalRef.current?.hide();
      }
    }

    setEventTitle('Purchasing $TEA');
    eventModalRef.current?.show();
    const result = await buyExactPresaleTokens({
      optionId: investmentInfo[investment].id,
      referrerId: Number(window.localStorage.getItem('referral')),
      tokenSell: mappedCoins[selectedCoin].contract as Address,
      buyAmountHuman: amountInTea,
    });

    if (result.status === 'ERROR') {
      eventModalRef.current?.hide();
      setSubmitting(false);
      setEventInfo({
        title: 'Transaction Failed!',
        subTitle: result.message,
      });
      showModal();
      return false; // failed operation
    }

    eventModalRef.current?.hide();
    setSubmitting(false);
    setEventInfo({
      title: 'Transaction Succeed!',
      subTitle: result.message,
    });
    showModal();

    setAmount('');
    setAmountInTea('');
    handleOptionBalance();
    return true;
  };

  useEffect(() => {
    setAmount('');
    setAmountInTea('');
    handleOptionBalance();
  }, [investment]);

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
          <InvestmentOptions investmentOptions={Object.keys(investmentInfo)} value={investment} onChange={setInvestment} />
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
                  <img className="select-coin__icon" slot="prefix" src={mappedCoins[selectedCoin]?.icon} alt={mappedCoins[selectedCoin]?.label} />
                  {coins
                    .map((key) => mappedCoins[key])
                    .map(({ icon, label, value }) => (
                      <SlOption value={value} key={value}>
                        <img className="coin-icon" slot="prefix" src={icon} alt={label}  />
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
                  value={amount}
                  onChangeValue={async (value) => {
                    setAmount(value);

                    const amountsIn = await getQuoteAmountsOutForTeaTokens(
                      investmentInfo[investment].id,
                      mappedCoins[selectedCoin].contract as `0x${string}`,
                      value
                    );
                    const amountToHuman = amountsIn / BigInt(1e18);
                    setAmountInTea(amountToHuman.toString());
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
                  value={bigDecimal.round(amountInTea, 2)}
                  onChangeValue={async (value) => {
                    setAmountInTea(value);

                    const amountsIn = await getQuoteAmountsInForTeaTokens(
                      investmentInfo[investment].id,
                      mappedCoins[selectedCoin].contract as `0x${string}`,
                      value
                    );
                    const amountToHuman = amountsIn / BigInt(1e18);
                    setAmount(amountToHuman.toString());
                  }}
                />
              </div>
            </SlCard>
          </SlCard>
          <SlButton onClick={enterPresale} disabled={buyButtonDisabled} variant="primary" className="buy__btn">
            {submitting ? <Spinner /> : (selectedCoinIsAllowed ? 'Buy $TEA' : "Allow " + selectedCoin.toUpperCase())}
          </SlButton>
        </>
      )}
    </div>
  );
};
