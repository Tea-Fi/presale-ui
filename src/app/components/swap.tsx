import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Avatar, AvatarImage, Button, Input } from '../components/ui';
import { TeaTokenLogoAsset } from '../../assets/icons';
import { ArrowDownUpIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn, parseHumanReadable } from '../utils';
import { getBalance, getAccount, getChainId, waitForTransactionReceipt } from '@wagmi/core';

import { Token, wagmiConfig } from '../config';
import { Address, erc20Abi, maxUint256, parseUnits, zeroAddress } from 'viem';
import { buyExactPresaleTokens, getInputPriceQuote, getOptionInfo, getQuoteAmountsInForTeaTokens, getQuoteAmountsOutForTeaTokens } from '../utils/presale';
import { PRESALE_CONTRACT_ADDRESS, investmentInfo } from '../utils/constants';
import { useReadContract, useWriteContract } from 'wagmi';
import Spinner from './spinner';

export const SwapContainer = ({ tokenList }: { tokenList: Token[] }) => {
    const search = window.location.search;
    const urlParams = new URLSearchParams(search);
    const investment = urlParams.get('opt') || Object.keys(investmentInfo)[0];
    const referrerId = Number(window.localStorage.getItem('referral') || '0');

    const [isReversed, setReversed] = useState<boolean>(true);
    const [balance, setBalance] = useState<string | number>(0);
    const [tokenSellValue, setTokenSellValue] = useState<string | number>('');
    const [tokenBuyValue, setTokenBuyValue] = useState<string | number>('');

    const [isTypingForTokenBuy, setIsTypingForTokenBuy] = useState<boolean>(false);
    const [isTypingForTokenSell, setIsTypingForTokenSell] = useState<boolean>(false);

    const [teaBalance, setTeaBalance] = useState<string | number>(0);

    const [selectedToken, setSelectedToken] = useState<Token>(tokenList[0]);
    const [selectedTokenPrice, setSelectedTokenPrice] = useState<string | number>(0);

    const [tokenIsApproved, setTokenIsApproved] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const account = getAccount(wagmiConfig);
    const chainId = getChainId(wagmiConfig);

    const allowances = useReadContract({
        abi: erc20Abi,
        config: wagmiConfig,
        address: selectedToken.address,
        args: [account.address as Address, PRESALE_CONTRACT_ADDRESS[chainId] as Address],
        functionName: 'allowance',
    });

    let {
        // @ts-ignore
        isPending,
        // @ts-ignore
        isSuccess,
        // @ts-ignore
        isError,
        writeContract
    } = useWriteContract();

    const approveToken = async (token: Address) => {
        setIsLoading(true);
        const hash = await writeContract({
            address: token,
            abi: erc20Abi,
            functionName: 'approve',
            args: [
                PRESALE_CONTRACT_ADDRESS[chainId] as Address,
                maxUint256,
            ],
        });

        if (hash == undefined) {
            setIsLoading(false);
            return {
                status: 'ERROR',
                message: 'Operation cancelled by user',
                txid: null,
            };
        }

        const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, { hash });
        setIsLoading(false);

        if (transactionReceipt.status == 'success') {
            return {
                status: 'SUCCESS',
                message: 'Allowance successfully set',
                txid: hash,
            }; 
        }

        return {
            status: 'ERROR',
            message: 'Error setting allowance',
            txid: null,
        };
    }

    const handleBuy = async (token: Address, value: string) => {
        console.info('optionId', investmentInfo[investment].id)
        console.info('referrerId', referrerId)
        console.info('tokenSell', token)
        console.info('buyAmountHuman', value)

        setIsLoading(true);
        const result = await buyExactPresaleTokens({
            optionId: investmentInfo[investment].id,
            referrerId: referrerId,
            tokenSell: token,
            buyAmountHuman: value,
        });
        setIsLoading(false);

        if (result.status == 'SUCCESS') {
            getTeaBalance().then((res) => setTeaBalance(
                parseHumanReadable(res.value, res.decimals, 3)
            ));
        }

        return result;
    };

    const getSelectedTokenBalance = async () => {
        const balance = await getBalance(wagmiConfig, {
            address: account.address ?? zeroAddress,
            token: selectedToken.address === zeroAddress ? undefined : selectedToken.address,
        });

        return balance;
    };

    const getSelectedTokenPrice = async () => {
        if (selectedToken.symbol == 'USDC' || selectedToken.symbol == 'USDT'  || selectedToken.symbol == 'DAI') {
            return 1;
        }

        const price = await getInputPriceQuote(
            selectedToken.address,
            BigInt(10 ** selectedToken.decimals)
        );

        return parseHumanReadable(price, 6, 2);
    };


    const getTeaBalance = async () => {
        const optionInfo = await getOptionInfo(investmentInfo[investment].id);
        const teaToken = optionInfo.presaleToken;

        const balance = await getBalance(wagmiConfig, {
            address: account.address ?? zeroAddress,
            token: teaToken,
        });

        return balance;
    };

    const checkTokenAllowance =  async () => {
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
        checkTokenAllowance();
    }, [allowances]);

    useEffect(() => {
        allowances.refetch();
    }, [isSuccess, isError]);

    useEffect(() => {
        allowances.refetch();

        // reset states...
        setIsTypingForTokenSell(false);
        setIsTypingForTokenBuy(false);
        setTokenBuyValue('');
        setTokenSellValue('');
        setSelectedTokenPrice('');

        getSelectedTokenPrice().then((res) => {
            setSelectedTokenPrice(res)
        });

        getTeaBalance().then((res) => setTeaBalance(
            parseHumanReadable(res.value, res.decimals, 3)
        ));

        getSelectedTokenBalance().then((res) => setBalance(
            parseHumanReadable(res.value, res.decimals, 3)
        ));
    }, [selectedToken, isReversed]);

    return (
        <div className='flex flex-col gap-2 p-2 rounded-xl max-w-[480px] w-[480px] h-auto bg-[rgb(19,19,19)]'>
            <div className='flex flex-col mb-2'>
                <span className='text-zinc-400 text-xl font-bold'>TEA price ${investment}</span>
                <span className='text-zinc-500 text-base'>{investmentInfo[investment].tge}</span>
                <span className='text-zinc-500 text-base'>{investmentInfo[investment].vested}</span>
            </div>

            <div className={cn('relative flex gap-2', !isReversed ? 'flex-col-reverse' : 'flex-col')}>
                <SwapInput
                    disabled={isLoading || isPending || selectedTokenPrice == '' || !isReversed}
                    title='Sell'
                    balance={balance}
                    value={
                        isTypingForTokenSell ?
                            undefined :
                            tokenSellValue ?? ''
                    }
                    tokenList={tokenList}
                    defaultValue={'ETH'}
                    onChange={(value: string) => {
                        const token = tokenList.find(token => token.symbol === value);
                        setSelectedToken(token ?? tokenList[0]);
                    }}
                    onType={async (e) => {
                        setIsTypingForTokenSell(true);
                        if (isTypingForTokenBuy == true) {
                            setIsTypingForTokenBuy(false);
                        }

                        const value = e.target.value;


                        if (value.length == 0 || value == '0') {
                            setTokenBuyValue('');
                            return;
                        }

                        const amountsIn = await getQuoteAmountsOutForTeaTokens(
                            investmentInfo[investment].id,
                            selectedToken.address,
                            value,
                        );

                        setTokenBuyValue(parseHumanReadable(
                            amountsIn,
                            18,
                            6
                        ));
                    }}
                />

                <Button
                    onClick={() => setReversed(!isReversed)}
                    className='absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 outline outline-[6px] outline-[rgb(19,19,19)] bg-[rgb(27,27,27)] hover:bg-[rgb(25,25,25)]'
                >
                    <ArrowDownUpIcon className='text-zinc-400' />
                </Button>

                <SwapInput
                    disabled={isLoading || isPending || selectedTokenPrice == '' || isReversed}
                    title='Buy'
                    balance={teaBalance}
                    value={
                        isTypingForTokenBuy ?
                            undefined :
                            tokenBuyValue ?? ''
                    }
                    isTea
                    onType={async (e) => {
                        setIsTypingForTokenBuy(true);
                        if (isTypingForTokenSell == true) {
                            setIsTypingForTokenSell(false);
                        }

                        const value = e.target.value;

                        if (value.length == 0 || value == '0') {
                            setTokenSellValue('');
                            return;
                        }

                        setTokenBuyValue(value);

                        const amountsIn = await getQuoteAmountsInForTeaTokens(
                            investmentInfo[investment].id,
                            selectedToken.address,
                            value,
                        );
                        setTokenSellValue(parseHumanReadable(
                            amountsIn,
                            selectedToken.decimals,
                            6
                        ));
                    }}
                />
            </div>

            <Button disabled={isLoading || isPending || selectedTokenPrice == '' || tokenBuyValue.toString() == '' || tokenBuyValue.toString() == '0'}
                onClick={async () => {
                    if (!tokenIsApproved) {
                        await approveToken(selectedToken.address);
                    } else {
                        await handleBuy(
                            selectedToken.address,
                            tokenBuyValue.toString(),
                        )
                    }
                }}
                className='bg-[#680043] hover:bg-[#aa006f] text-xl font-bold text-[#ff00a6] py-6'
            >
                {(isPending || isLoading) ? <Spinner /> : (tokenIsApproved ? 'Buy' : `Allow ${selectedToken.symbol}`)}
            </Button>

            <div className='text-right text-zinc-500'>
                {selectedTokenPrice == '' ? <Spinner /> : <span>{selectedToken.symbol} price: ${selectedTokenPrice}</span>}
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
    disabled?: boolean,
    title?: string,
    defaultValue?: string,
    tokenList?: Token[],
    value?: string | number,
    balance?: number | string,
    isTea?: boolean,
    onChange?: (value: string) => void,
    onType?: (param: React.ChangeEvent<HTMLInputElement>) => void,
}) => {
    return (
        <div className='w-full rounded-lg h-24 px-4 py-3 bg-[rgb(27,27,27)]'>
            <div className='inline-flex justify-between w-full items-start'>
                <span className='text-zinc-400'>{title ?? 'Amount'}</span>
                <span className='text-zinc-500 text-sm'>Balance: {balance ?? 0}</span>
            </div>

            <div className='inline-flex gap-2 w-full h-10'>
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
                            value !== 'Backspace' &&
                            value !== 'ArrowLeft' &&
                            value !== 'ArrowRight' &&
                            value !== 'ArrowDown' &&
                            value !== 'ArrowUp'
                        ) {
                            e.preventDefault();
                        }
                    }}
                    type="number"
                    inputMode='decimal'
                    onChange={onType}
                    placeholder='0'
                    className='bg-transparent text-3xl px-0 text-zinc-300 placeholder:text-zinc-600 h-full'
                />

                {isTea ?
                    <div className='inline-flex gap-3 items-center rounded-full bg-[rgb(19,19,19)] h-full px-2 w-44 text-zinc-400'>
                        <Item isTea />
                    </div>
                    :
                    <SelectContainer
                        // disabled={disabled}
                        defaultValue={defaultValue}
                        onChange={onChange}
                        items={tokenList}
                    />
                }
            </div>
        </div>
    );
}

const SelectContainer = ({ items, defaultValue, onChange, disabled }: { items?: Token[], defaultValue?: string, onChange?: (value: string) => void, disabled?: boolean }) => {
    return (
        <Select disabled={disabled} onValueChange={onChange} defaultValue={defaultValue}>
            <SelectTrigger
                className='inline-flex gap-3 items-center rounded-full bg-[rgb(19,19,19)] h-full px-2 w-44 text-zinc-400'
            >
                <SelectValue placeholder='Select token' />
            </SelectTrigger>

            <SelectContent className='bg-[rgb(19,19,19)]'>
                <SelectGroup>
                    {items ? items.map(((item, index) =>
                        <SelectItem key={index} value={item.symbol} className='hover:bg-[rgb(27,27,27)] focus:bg-[rgb(27,27,27)]'>
                            <Item url={item.imageUrl} value={item.symbol} />
                        </SelectItem>
                    ))
                        : <></>
                    }
                </SelectGroup>
            </SelectContent>

        </Select>
    );
}

const Item = ({ value, url, isTea }: { value?: string, url?: string, isTea?: boolean }) => {
    return (
        <div className='inline-flex gap-3 items-center rounded-full bg-[rgb(19,19,19)] h-full px-2'>
            {isTea ?
                <span>
                    <TeaTokenLogoAsset className='rounded-full size-6' />
                </span>
                :
                <Avatar className='items-center justify-center w-auto'>
                    <AvatarImage
                        className={'size-6'}
                        src={url ?? ''}
                        alt={value ?? ''}
                    />
                </Avatar>}
            <span className='text-zinc-400 font-semibold'>
                {isTea ? 'TEA' : value ?? ''}
            </span>
        </div>
    );
}