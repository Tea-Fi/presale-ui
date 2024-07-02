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

export const projects = [
    {
        title: "0.16$",
        description: `${investmentInfo["0.16"].vested}. ${investmentInfo["0.16"].tge}`,
        link: "/buy",
    },
    {
        title: "0.20$",
        description: investmentInfo["0.2"].vested,
        link: "/buy",
    },
    {
        title: "0.24$",
        description: investmentInfo["0.24"].vested,
        link: "/buy",
    },
];