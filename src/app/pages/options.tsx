import { useEffect, useState } from "react";
import { CardHoverEffect } from "../components/ui"; 
import { investmentInfo } from "../utils/constants";
import { getOptionInfo, getSaleOptionsCout, getTokensAvailable } from "../utils/presale";
import { parseHumanReadable } from "../utils";
import { parseEther } from "viem";

export const Options = () => {
    const [projectInfos, setProjectInfos] = useState<any>();

    useEffect(() => {
        const handleOptionsInfo = async () => {
            try {
                const [optionsCount, tokensAvailable] = await Promise.all([
                    getSaleOptionsCout(),
                    getTokensAvailable(),
                ]);


                const maxPerOption = parseHumanReadable(tokensAvailable / optionsCount, 18);

                const optionsInfoQuery = [];
                for(let i = 0; i < optionsCount; i++) {
                    optionsInfoQuery.push(await getOptionInfo(i));
                }
                const optionsInfo = await Promise.all(optionsInfoQuery);

                const optionsInfoObj = [];
                for(let i = 0; i < optionsCount; i++) {
                    const price = parseHumanReadable(optionsInfo[i].price, 2, 2);
                    const sold = parseHumanReadable(optionsInfo[i].sold, 18);
                    const tge = optionsInfo[i].tgeAmount;
                    const vested = optionsInfo[i].leftoverVesting;
                    const months = i == 0 || i == 1 ? 12 : i == 2 ? 6 : 2;


                    optionsInfoObj.push({
                        title: `$${price} / $TEA`,
                        description: `${tge}% - released at TGE and ${vested}% - vested linearly over ${months} months`,
                        link: `/?opt=${price}#/buy`,
                        max: maxPerOption,
                        value: sold,
                    });
                }

                return optionsInfoObj;
            } catch(e) {

            }
        }

        handleOptionsInfo().then((projects) => setProjectInfos(projects));
    }, [projectInfos]);


    return (
        <div className="inline-flex grow justify-center w-full items-center">
            <div className="w-96">
                <CardHoverEffect items={projectInfos ?? []}/>
            </div>
        </div>
    );
};
