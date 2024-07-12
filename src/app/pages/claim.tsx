import { getChainId, getAccount, readContract } from '@wagmi/core';
import { PRESALE_ABI } from '../utils/presale_abi';
import { PRESALE_CONTRACT_ADDRESS } from '../utils/constants';
import { wagmiConfig } from '../config';
import { Address, erc20Abi } from 'viem';
import { useReadContract } from 'wagmi';
import { useEffect, useState } from 'react';
import { parseHumanReadable } from '../utils';
import { toast } from "sonner";
import Spinner from '../components/spinner';
import { investmentInfo } from "../utils/constants";
import { Card, CardDescription, CardTitle } from '../components/ui';


export const Claim = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [, setIsError] = useState<boolean>(false);
  const [totalSoldTea, setTotalSoldTea] = useState<string | number>(0);
  const [totalAvailableTea, setTotalAvailableTea] = useState<string | number>(0);

  const chainId = getChainId(wagmiConfig);
  const account = getAccount(wagmiConfig);

  const totalSoldTeaResult = useReadContract({
    abi: PRESALE_ABI,
    address: PRESALE_CONTRACT_ADDRESS[chainId] as Address,
    functionName: 'totalSold',
  });

  const totalAvailableTeaResult = useReadContract({
    abi: PRESALE_ABI,
    address: PRESALE_CONTRACT_ADDRESS[chainId] as Address,
    functionName: 'tokensAvailableForPresale',
  });


  useEffect(() => {
    const handleQueryResults = () => {
      if(
        totalSoldTeaResult.isLoading || 
        totalAvailableTeaResult.isLoading
      ) {
        setIsLoading(true);
      } else if(
        totalSoldTeaResult.isSuccess &&
        totalAvailableTeaResult.isSuccess
      ) {
        const totalSoldNormal = parseHumanReadable(totalSoldTeaResult.data as bigint, 18, 2);
        const totalAvailableNormal = parseHumanReadable(totalAvailableTeaResult.data as bigint, 18, 0);

        setTotalSoldTea(totalSoldNormal.toLocaleString('en-US'));
        setTotalAvailableTea(totalAvailableNormal.toLocaleString('en-US'));
        
        setIsLoading(false);
        setIsError(false);
      } else if(
        totalSoldTeaResult.isError &&
        totalAvailableTeaResult.isError
      ) {
        toast.error(
          "An error occured due to fetching data ", {
          duration: 5000,
        });

        setIsError(true);
      }
    }

    handleQueryResults();
  }, [account, totalAvailableTeaResult, totalSoldTeaResult]);


  const [tgeInfos, setTgeInfos] = useState<any>(
    Object.keys(investmentInfo).map((price) => ({
      price: `$${price}`,
      optionId: investmentInfo[price].id,
      tge: null,
      balance: null,
    }))
  );

  useEffect(() => {
    const handleOptionsInfo = async () => {
      try {
        const optionInfos = await Promise.all(tgeInfos.map((info: any) => 
          readContract(wagmiConfig, {
            abi: PRESALE_ABI,
            address: PRESALE_CONTRACT_ADDRESS[chainId] as Address,
            functionName: 'saleOptions',
            args: [info.optionId],
          })
        ));


        const balances = [];

        for(const info of optionInfos) {
          const balance = await readContract(wagmiConfig, {
            abi: erc20Abi,
            // [3] means presaleToken in contract struct
            address: info[3] as Address,
            functionName: 'balanceOf',
            args: [account.address as Address],
          });

          balances.push(balance);
        }

        return [balances, optionInfos];
      } catch (e) {
        console.error(e);
      }
    };

    handleOptionsInfo().then((data: any) => {
      const balances = data[0];
      const optionInfos = data[1];

      // console.log(data[1][0][0])
      
      if(balances === undefined) {
        return;
      }


      const newInfo = [];
      for(let i = 0; i < balances.length; i++) {
        newInfo.push({
          ...tgeInfos[i],
          balance: parseHumanReadable(balances[i], 18, 2),
          tge: optionInfos[i][0]
        });
      }
      setTgeInfos(newInfo);
    });
  }, [account]);

  const handleCalculateTgeAmount = (balance?: number, tge?: bigint) => {
    if(balance !== undefined && tge !== undefined) {
      return balance * Number(tge) / 100;
    } 

    return 0;
  }

  return (
    <div className="claim flex flex-col mx-auto">
      <h1>Claim</h1>
      <p>Token claim will be available at $TEA token's TGE</p>

      <span className='text-center'>Total TEA {isLoading ? <Spinner /> : `${totalSoldTea}/${totalAvailableTea}`}</span>

      <div className="mt-10 inline-flex gap-4 px-8 justify-center w-full max-w-[1400px] items-center mx-auto flex-wrap">
        {tgeInfos && tgeInfos.length ? 
          tgeInfos.map((projectInfo: any, index: number) => 
            <Card key={index} className='size-64'>
              <CardTitle>You bought:</CardTitle>
              <CardDescription className='flex flex-col gap-3'>
                <span className='text-lg'>{projectInfo.balance !== null ? projectInfo.balance.toLocaleString('en-US') : <Spinner />} TEA by {projectInfo.price}</span>
                <span className='mt-2 text-base'>You will receive at TGE: {projectInfo.tge !== null && handleCalculateTgeAmount(projectInfo.balance, projectInfo.tge) !== null ? ` ${handleCalculateTgeAmount(projectInfo.balance, projectInfo.tge)?.toLocaleString()} - ${projectInfo.tge}%` : <Spinner />}</span>
              </CardDescription>
            </Card>
          )
          : <></>
        }
      </div>
    </div>
  );
};
