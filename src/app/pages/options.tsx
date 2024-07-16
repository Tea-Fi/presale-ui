import { useEffect, useState } from "react";
import { ZeroAddress } from "ethers/constants";
import { CardHoverEffect, Collapsible, CollapsibleContent, CollapsibleTrigger, Progress } from "../components/ui";
import {
  getOptionInfo,
  getSaleOptionsCout,
  getTokensAvailable,
} from "../utils/presale";
import { parseHumanReadable } from "../utils";
import { investmentInfo } from "../utils/constants";
import Spinner from "../components/spinner";

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
    <div className="flex flex-col-reverse mt-20 lg-mt-0 lg:flex-row grow justify-center w-full items-center gap-8">
      <div className="w-96">
        <CardHoverEffect items={projectInfos} />
      </div>
      <div>
        <div>
          <Collapsible className="flex flex-col text-zinc-400 gap-5">
            <CollapsibleTrigger>
              <div className="py-3 px-14 border rounded-2xl border-white/20">
                Allocation Status V
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="w-72">
                {projectInfos && projectInfos.length ?
                  projectInfos.map((info: any, index: number) => 
                    <div key={index} className="flex flex-col gap-3 mt-4">
                      <div className="inline-flex justify-between text-zinc-400 text-sm">
                        <span>{info.title == null ? <Spinner/> : info.title}</span>

                        <div>
                          <span>
                            {info.value == null ? <Spinner/> : (+info.value).toLocaleString('en-US')} / {info.max == null ? <Spinner/> : (+info.max).toLocaleString('en-US')}
                          </span>
                          {/* <span>{info.value == null ? <Spinner/> : `${parseFloat((info.value / (info.max ?? 100) * 100).toFixed(2))}%`}</span> */}
                        </div>
                      </div>

                      <Progress value={info.value}  max={info.max}/>
                    </div>
                  )
                  :
                  <></>
                }
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
};
