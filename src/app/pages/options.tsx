import { CardHoverEffect } from "../components/ui"; 
import { investmentInfo } from "../utils/constants";

export const Options = () => {
    return (
        <div className="inline-flex grow justify-center w-full items-center">
            <div className="w-96">
                <CardHoverEffect items={projects}/>
            </div>
        </div>
    );
};

export const projects = Object.keys(investmentInfo).map(price => ({
    title: `$${price} / $TEA`,
    description: `${investmentInfo[price].tge} and ${investmentInfo[price].vested}`,
    link: `/buy?opt=${price}#buy`,
}));
