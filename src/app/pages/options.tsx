import { useEffect, useState } from "react";
import { ZeroAddress } from "ethers/constants";
import { CardHoverEffect } from "../components/ui";
import {
  getOptionInfo,
  getSaleOptionsCout,
  getTokensAvailable,
} from "../utils/presale";
import { parseHumanReadable } from "../utils";
import { investmentInfo } from "../utils/constants";

export const Options = () => {
  const [projectInfos, setProjectInfos] = useState<any>(
    Object.keys(investmentInfo).map((price) => ({
      title: `$${price} / $TEA`,
      description: `${investmentInfo[price].tge} and ${investmentInfo[price].vested}`,
      link: `/?opt=${price}#/buy`,
      max: null,
      value: null,
    }))
  );

  useEffect(() => {
    const handleOptionsInfo = async () => {
      try {
        const [optionsCount, tokensAvailable] = await Promise.all([
          getSaleOptionsCout(),
          getTokensAvailable(),
        ]);

        const maxPerOption = parseHumanReadable(
          tokensAvailable / optionsCount,
          18
        );

        const optionsInfoQuery = [];
        for (let i = 0; i < optionsCount; i++) {
          optionsInfoQuery.push(await getOptionInfo(i));
        }
        const optionsInfo = await Promise.all(optionsInfoQuery);

        const optionsInfoObj = [];
        for (let i = 0; i < optionsCount; i++) {
          const price = parseHumanReadable(optionsInfo[i].price, 2, 2);
          const sold = parseHumanReadable(optionsInfo[i].sold, 18);

          if (
            optionsInfo[i].presaleToken == ZeroAddress ||
            investmentInfo[price] == undefined
          ) {
            continue;
          }

          optionsInfoObj.push({
            title: `$${price} / $TEA`,
            description: `${investmentInfo[price].tge} and ${investmentInfo[price].vested}`,
            link: `/?opt=${price}#/buy`,
            max: maxPerOption,
            value: sold,
          });
        }

        return optionsInfoObj;
      } catch (e) {
        console.error(e);
      }
    };

    handleOptionsInfo().then((projects) => {
      setProjectInfos(projects);
    });
  }, []);

  if (!projectInfos) return null;

  return (
    <div className="inline-flex grow justify-center w-full items-center">
      <div className="w-96">
        <CardHoverEffect items={projectInfos} />
      </div>
    </div>
  );
};
