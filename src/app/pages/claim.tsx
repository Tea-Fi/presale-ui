import { getChainId, getAccount, readContract } from '@wagmi/core';
import { PRESALE_ABI } from '../utils/presale_abi';
import { PRESALE_CONTRACT_ADDRESS } from '../utils/constants';
import { wagmiConfig } from '../config';
import { Address, erc20Abi } from 'viem';
import { useEffect, useState } from 'react';
import { parseHumanReadable } from '../utils';
import Spinner from '../components/spinner';
import { investmentInfo } from "../utils/constants";
import { Card, CardDescription, CardTitle } from '../components/ui';


export const Claim = () => {
  const [totalSoldTeaPerAccount, setTotalSoldTeaPerAccount] = useState<string | number | undefined>(undefined);

  const chainId = getChainId(wagmiConfig);
  const account = getAccount(wagmiConfig);


  const [tgeInfos, setTgeInfos] = useState<any>(
    Object.keys(investmentInfo).map((price) => ({
      price: `$${price}`,
      optionId: investmentInfo[price].id,
      tge: null,
      balance: null,
    }))
  );

  const handleOptionsInfo = async () => {
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
  };

  useEffect(() => {
    handleOptionsInfo().then((data: any) => {
      const balances = data[0];
      const optionInfos = data[1];

      if(balances === undefined) {
        return;
      }


      const newInfo = [];
      let calculatedBalances = 0;
      for(let i = 0; i < balances.length; i++) {
        calculatedBalances += parseHumanReadable(balances[i], 18, 2);
        
        
        newInfo.push({
          ...tgeInfos[i],
          balance: parseHumanReadable(balances[i], 18, 2),
          tge: optionInfos[i][0]
        });
      }

      setTotalSoldTeaPerAccount(Number(calculatedBalances.toFixed(2)).toLocaleString('en-US'));
      setTgeInfos(newInfo);
    });
  }, []); // <-- if add here account than you get infinite requests to RPC...

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

      <span className='text-center'>Total Bought: {totalSoldTeaPerAccount === undefined ? <Spinner /> : totalSoldTeaPerAccount} $TEA</span>

      <div className="mt-10 inline-flex gap-4 px-8 justify-center w-full max-w-[1400px] items-center mx-auto flex-wrap">
        {tgeInfos && tgeInfos.length ? 
          tgeInfos.map((projectInfo: any, index: number) => 
            <Card key={index} className='size-64'>
              <CardTitle>{projectInfo.price} / $TEA</CardTitle>
              <CardDescription className='flex flex-col gap-3'>
                <span className='text-lg'>{projectInfo.balance !== null ? projectInfo.balance.toLocaleString('en-US') : <Spinner />} $TEA</span>
                <span className='mt-2 text-base'>
                  Claim at TGE{projectInfo.tge !== null ? ` (${projectInfo.tge}%)` : ''}: {projectInfo.tge !== null && handleCalculateTgeAmount(projectInfo.balance, projectInfo.tge) !== null
                    ? ` ${handleCalculateTgeAmount(projectInfo.balance, projectInfo.tge)?.toLocaleString()} $TEA`
                    : <Spinner />}
                </span>
              </CardDescription>
            </Card>
          )
          : <></>
        }
      </div>
    </div>
  );
};
