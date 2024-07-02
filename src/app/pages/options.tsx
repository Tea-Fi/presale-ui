import { OptionCard } from "../components/option-card";
import { investmentInfo } from "../utils/constants";
const optionKeys = [
    "0.16",
    "0.2",
    "0.24"
];

export const Options = () => {
    return (
        <div className="flex flex-col gap-5 mt-5">
            {optionKeys.map((option, index) => 
                <OptionCard
                    key={index}
                    title={`Option #${investmentInfo[option].id}`}
                    price={option}
                    tgeDescription={investmentInfo[option].tge}
                    vestedDescription={investmentInfo[option].vested}
                />
            )}
        </div>
    );
};
