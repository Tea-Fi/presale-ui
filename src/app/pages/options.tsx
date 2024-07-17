import { useEffect, useState } from "react";
import { ZeroAddress } from "ethers/constants";
// import { CardHoverEffect, Collapsible, CollapsibleContent, CollapsibleTrigger, Progress } from "../components/ui";
import { CardHoverEffect, Collapsible, CollapsibleContent, CollapsibleTrigger, Progress }  from "../components/ui";
import {
  getOptionInfo,
  getSaleOptionsCout,
  getTokensAvailable,
} from "../utils/presale";
import { cn, parseHumanReadable } from "../utils";
import { investmentInfo } from "../utils/constants";
import Spinner from "../components/spinner";
import { MdKeyboardArrowDown } from "react-icons/md";
import { TeaCup } from "../../assets/icons";

export const Options = () => {
  const [dropdownOpened, setDropdownOpened] = useState<boolean>(false);

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
      <div className="flex flex-col gap-8 lg:mb-20">
        <img src={TeaCup} className="w-64 lg:w-96 -rotate-6"/>

        <Collapsible className="flex flex-col text-zinc-400 gap-5">
            <CollapsibleTrigger onClick={() => setDropdownOpened(!dropdownOpened)}>
              <div className="inline-flex items-center justify-between py-3 px-2 min-w-72 border rounded-2xl border-white/20">
                <div className="grow">
                  Allocation Status
                </div>

              <MdKeyboardArrowDown className={cn("transition-all", dropdownOpened ? "rotate-180" : "")}/>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="inline-flex justify-center">
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
  );
};
