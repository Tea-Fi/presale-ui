import React from "react";
import {useEffect, useState} from "react";
import {ZeroAddress} from "ethers/constants";
// import { CardHoverEffect, Collapsible, CollapsibleContent, CollapsibleTrigger, Progress } from "../components/ui";
import {CardHoverEffect, Collapsible, CollapsibleContent, CollapsibleTrigger} from "../components/ui";
import {
    getOptionInfo,
    getSaleOptionsCout,
    getTokensAvailable,
} from "../utils/presale";
import {cn, parseHumanReadable} from "../utils";
import {investmentInfo} from "../utils/constants";
import {MdKeyboardArrowDown} from "react-icons/md";
import {TeaCup} from "../../assets/icons";
import {track} from "../utils/analytics";
import PresaleHeadline from "../components/presale-headline";
import {ProjectInfoOption} from "../../types/options.ts";
import {ProjectCard} from "../components/options/ProjectCard/ProjectCard.tsx";
import {useReferralCode} from "../hooks/useReferralCode.ts";


export const Options = () => {
    const [dropdownOpened, setDropdownOpened] = useState<boolean>(false);
    const code = useReferralCode();

    const defaultProjectInfos: ProjectInfoOption[] = Object.keys(investmentInfo).map((price) => ({
        title: `$${price} / $TEA`,
        description: `${investmentInfo[price].tge} and ${investmentInfo[price].vested}`,
        link: `/${code}/buy?opt=${price}`,
        max: 0,
        value: 0,
    }))

    const [projectInfos, setProjectInfos] = useState<ProjectInfoOption[]>(defaultProjectInfos);

    const toggleDropdown = React.useCallback(() => {
        setDropdownOpened(state => !state)

        track({eventName: 'click_allocation_status'})
    }, [setDropdownOpened])


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

                const optionsInfoObj: ProjectInfoOption[] = [];
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
                        link: `/${code}/buy?opt=${price}`,
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
            if (!projects) return;

            setProjectInfos(projects);
        });
    }, []);


    if (!projectInfos) return null;

    return (
        <div className="inline-flex flex-col justify-center w-full">
            <PresaleHeadline/>
            <div className="flex flex-col-reverse lg-mt-0 lg:flex-row grow justify-center w-full items-center gap-8">
                <div className="w-96">
                    <CardHoverEffect items={projectInfos}/>
                </div>
                <div className="flex flex-col gap-8 lg:mb-20">
                    <div className="relative w-full">
                        <img src={TeaCup} className="w-64 lg:w-80 lg:mr-14"/>
                    </div>
                    <Collapsible className="flex flex-col text-zinc-400 gap-5">
                        <CollapsibleTrigger onClick={toggleDropdown}>
                            <div
                                className="inline-flex items-center justify-between py-3 px-2 min-w-72 border rounded-2xl border-white/20">
                                <div className="grow">
                                    Allocation Status
                                </div>

                                <MdKeyboardArrowDown
                                    className={cn("transition-all", dropdownOpened ? "rotate-180" : "")}/>
                            </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="inline-flex justify-center">
                            <div className="w-72">
                                {projectInfos && projectInfos.length ?
                                    projectInfos.map((info: ProjectInfoOption, index: number) =>
                                        <ProjectCard info={info} key={index}/>) : <></>
                                }
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </div>
        </div>
    );
};
