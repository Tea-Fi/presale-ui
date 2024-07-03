import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Avatar, AvatarImage, Button, Input } from '../components/ui';
import { TeaTokenLogoAsset } from '../../assets/icons';
import { ArrowDownUpIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn, parseHumanReadable } from '../utils';
import { getBalance, getAccount } from '@wagmi/core'

import { ChainId, Token, wagmiConfig } from '../config';
import { Address, erc20Abi, maxUint256, parseUnits, zeroAddress } from 'viem';
import { buyExactPresaleTokens, getInputPriceQuote, getOptionInfo, getQuoteAmountsInForTeaTokens, getQuoteAmountsOutForTeaTokens } from '../utils/presale';
import { PRESALE_CONTRACT_ADDRESS, investmentInfo } from '../utils/constants';
import { useReadContract, useWriteContract } from 'wagmi';



export const SwapContainer = ({tokenList}:{tokenList: Token[]}) => {
    const search = window.location.search;
    const urlParams = new URLSearchParams(search);
    const investment = urlParams.get('opt') || Object.keys(investmentInfo)[0];
    
    const [isReversed, setReversed] = useState<boolean>(false);
    const [balance, setBalance] = useState<string | number>(0);
    const [tokenSellValue, setTokenSellValue] = useState<string | number>('');
    const [tokenBuyValue, setTokenBuyValue] = useState<string | number>('');

    const [isTypingForTokenBuy, setIsTypingForTokenBuy] = useState<boolean>(false);
    const [isTypingForTokenSell, setIsTypingForTokenSell] = useState<boolean>(false);
    
    
    const [teaBalance, setTeaBalance] = useState<string | number>(0);

    const [selectedToken, setSelectedToken] = useState<Token>(tokenList[0]);
    const [selectedTokenPrice, setSelectedTokenPrice] = useState<string | number>(0);
    
    const [tokenIsApproved, setTokenIsApproved] = useState<boolean>(false);

    const account = getAccount(wagmiConfig);
    const result = useReadContract({
        abi: erc20Abi,
        config: wagmiConfig,
        address: selectedToken.address,
        args: [account.address as Address, PRESALE_CONTRACT_ADDRESS[ChainId.SEPOLIA] as Address],
        functionName: 'allowance',
    });

    const {
        // @ts-ignore
        isPending,
        // @ts-ignore
        isSuccess,
        // @ts-ignore
        isError,
        writeContract
    } = useWriteContract();


    const approveToken = (token: Address) => {
        writeContract({
            address: token,
            abi: erc20Abi,
            functionName: 'approve',
            args: [
                PRESALE_CONTRACT_ADDRESS[ChainId.SEPOLIA] as Address,
                maxUint256,
            ],
        });
    }

    const handleBuy = async (token: Address, value: string) => {
        return await buyExactPresaleTokens({
            optionId: investmentInfo[investment].id,
            referrerId: Number(window.localStorage.getItem('referral')),
            tokenSell: token,
            buyAmountHuman: value,
        });
    }



    useEffect(() => {
        const getSelectedTokenBalance = async () => {
            const balance = await getBalance(wagmiConfig, {
                address: account.address ?? zeroAddress,
                token: selectedToken.address === zeroAddress ? undefined : selectedToken.address,
            });

            return balance;
        }

        const getSelectedTokenPrice = async () => {
            if(selectedToken.symbol == 'USDC' || selectedToken.symbol == 'USDT') {
                return 1;
            }

            const price = await getInputPriceQuote(
                selectedToken.address,
                BigInt(10**selectedToken.decimals)
            );

            

            return parseHumanReadable(price, 6, 2);
        }


        const getTeaBalance = async () => {
            const optionInfo = await getOptionInfo(investmentInfo[investment].id);
            const teaToken = optionInfo.presaleToken;

            const balance = await getBalance(wagmiConfig, {
                address: account.address ?? zeroAddress,
                token: teaToken,
            });

            return balance;
        }


        const checkTokenAllowance = () => {
            if(selectedToken.address == zeroAddress) {
                setTokenIsApproved(true);
                return;
            }
            
            const inputValue = parseUnits(
                tokenSellValue.toString(),
                selectedToken.decimals
            );
            const allowance = result.data ?? 0n;

            if(allowance == 0n || inputValue >= allowance) {
                setTokenIsApproved(false);
                return;
            }

            setTokenIsApproved(true);
        }

        checkTokenAllowance();

        getSelectedTokenPrice().then((res) => {
            setSelectedTokenPrice(res)
        });

        getTeaBalance().then((res) => setTeaBalance(
            parseHumanReadable(res.value, res.decimals, 3)
        ));

        getSelectedTokenBalance().then((res) => setBalance(
            parseHumanReadable(res.value, res.decimals, 3)
        ));
    }, [selectedToken]);


    return (
        <div className='flex flex-col gap-2 p-2 rounded-xl max-w-[480px] w-[480px] h-auto bg-[rgb(19,19,19)]'>
            <div className='flex flex-col mb-2'>
                <span className='text-zinc-400 text-xl font-bold'>TEA price ${investment}</span>
                <span className='text-zinc-500 text-base'>{investmentInfo[investment].tge}</span>
                <span className='text-zinc-500 text-base'>{investmentInfo[investment].vested}</span>
            </div>

            <div className={cn('relative flex gap-2', !isReversed ? 'flex-col-reverse' : 'flex-col')}>
                <SwapInput
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
                        if(isTypingForTokenBuy == true) {
                            setIsTypingForTokenBuy(false);
                        }

                        const value = e.target.value;

                        if(value.length == 0 || value == '0') {
                            setTokenBuyValue('');
                        }

                        const amountsIn = await getQuoteAmountsOutForTeaTokens(
                            investmentInfo[investment].id,
                            selectedToken.address,
                            e.target.value,
                        );

                        setTokenBuyValue(parseHumanReadable(
                            amountsIn,
                            18,
                            4
                        ));
                    }}
                />
                
                <Button
                    onClick={() => setReversed(!isReversed)}
                    className='absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 outline outline-[6px] outline-[rgb(19,19,19)] bg-[rgb(27,27,27)] hover:bg-[rgb(25,25,25)]'
                    >
                    <ArrowDownUpIcon className='text-zinc-400'/>
                </Button>
                
                <SwapInput 
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
                        if(isTypingForTokenSell == true) {
                            setIsTypingForTokenSell(false);
                        }
                        
                        const value = e.target.value;

                        if(value.length == 0 || value == '0') {
                            setTokenSellValue('');
                        }
                        

                        const amountsIn = await getQuoteAmountsInForTeaTokens(
                            investmentInfo[investment].id,
                            selectedToken.address,
                            value,
                        );
                        setTokenSellValue(parseHumanReadable(
                            amountsIn,
                            selectedToken.decimals,
                            4
                        ));
                    }}
                />
            </div>

            <Button
                onClick={async () => {
                    if(!tokenIsApproved) {
                        approveToken(selectedToken.address);
                    } else {
                        await handleBuy(
                            selectedToken.address,
                            tokenBuyValue.toString(),
                        )
                    }
                }}
                className='bg-[#680043] hover:bg-[#aa006f] text-xl font-bold text-[#ff00a6] py-6'
            >
                {tokenIsApproved ? 'Buy' : 'Allow token'}
            </Button>


            <div className='text-right text-zinc-500'>
                <span>{selectedTokenPrice}$: {selectedToken.symbol}</span>
            </div>
        </div>
    );
};


const SwapInput = ({
    title,
    balance,
    isTea,
    tokenList,
    defaultValue,
    value,
    onChange,
    onType,
}:{
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
                <span className='text-zinc-500 text-sm'>{balance ?? 0}</span>
            </div>
            
            <div className='inline-flex gap-2 w-full h-10'>
                <Input
                    value={value}
                    onKeyDown={(e) => {
                        const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
                        const otherChars = '\'!@#$%^&*()_+=-,:/?<>{}'.split('');

                        const charsDisabled = [...alphabet, ...otherChars]
                        const isDisabled = charsDisabled.indexOf(e.key) != -1;

                        if (isDisabled) {
                            e.preventDefault();
                        }
                    }}
                    onChange={onType}
                    placeholder='0'
                    className='bg-transparent text-3xl px-0 text-zinc-300 placeholder:text-zinc-600 h-full'
                />

                {isTea ?
                    <div className='inline-flex gap-3 items-center rounded-full bg-[rgb(19,19,19)] h-full px-2 w-44 text-zinc-400'>
                        <Item isTea/>
                    </div>
                :
                    <SelectContainer
                        defaultValue={defaultValue}
                        onChange={onChange}
                        items={tokenList}
                    />
                }
            </div>
        </div>
    );
}

const SelectContainer = ({items, defaultValue, onChange}:{items?: Token[], defaultValue?: string,  onChange?: (value: string) => void}) => {
    return (
        <Select onValueChange={onChange} defaultValue={defaultValue}>
            <SelectTrigger 
                className='inline-flex gap-3 items-center rounded-full bg-[rgb(19,19,19)] h-full px-2 w-44 text-zinc-400'
            >
                <SelectValue placeholder='Select token' />
            </SelectTrigger>

            <SelectContent className='bg-[rgb(19,19,19)]'>
                <SelectGroup>
                    {items ? items.map(((item, index) => 
                        <SelectItem key={index} value={item.symbol} className='hover:bg-[rgb(27,27,27)] focus:bg-[rgb(27,27,27)]'>
                            <Item url={item.imageUrl} value={item.symbol}/>
                        </SelectItem>
                    ))
                    : <></>
                }
                </SelectGroup>
            </SelectContent>

        </Select>
    );
}

const Item = ({value, url, isTea}:{value?: string, url?: string, isTea?: boolean}) => {
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