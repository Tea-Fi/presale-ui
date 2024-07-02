"use client";

import { cn } from "../utils/cn";
import { TeaSwapLogoAsset } from "../../assets/icons";
import { Button } from "./ui";

export function OptionCard({title, tgeDescription, vestedDescription, price}:{title?: string, tgeDescription?: string, vestedDescription?: string, price?: number | string}) {
    return (
        <Card>
            <CardSkeletonContainer>
                <Skeleton />
            </CardSkeletonContainer>

            <CardTitle className="flex justify-between items-center">
                <span>

                    {title ?? "Title"}
                </span>
                <span className="text-sm text-[#]">{`${price}$` ?? "0.00$"}</span>
            </CardTitle>

            <CardDescription>
                {tgeDescription ?? ""}
            </CardDescription>

            <CardDescription>
                {vestedDescription ?? ""}
            </CardDescription>

            <div className="mt-5 flex justify-end">
                <Button 
                    className="rounded text-md font-bold text-white bg-[#f716a2] hover:bg-[#880d5a] hover:text-slate-500"
                >
                    Open
                </Button>
            </div>
        </Card>
    );
}

const Skeleton = () => {
    return (
        <div className="p-8 overflow-hidden h-full relative flex items-center justify-center">
            <div className="flex flex-row flex-shrink-0 justify-center items-center gap-2">
                <TeaSwapLogoAsset />
            </div>
        </div>
    );
};


export const Card = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <div
        className={cn(
            "max-w-sm w-full mx-auto p-8 rounded-xl border border-[rgba(255,255,255,0.10)] dark:bg-[rgba(40,40,40,0.70)] bg-gray-100 shadow-[2px_4px_16px_0px_rgba(248,248,248,0.06)_inset] group",
            className
        )}
        >
        {children}
        </div>
    );
};

export const CardTitle = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <h3
            className={cn(
                "text-lg font-semibold text-gray-800 dark:text-white py-2",
                className
            )}
        >
            {children}
        </h3>
    );
};

export const CardDescription = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <p
            className={cn(
                "text-sm font-normal text-neutral-600 dark:text-neutral-400 max-w-sm",
                className
            )}
        >
            {children}
        </p>
    );
};

export const CardSkeletonContainer = ({
    className,
    children,
    showGradient = true,
}: {
    className?: string;
    children: React.ReactNode;
    showGradient?: boolean;
}) => {
    return (
        <div
            className={cn(
                "h-[15rem] md:h-[20rem] rounded-xl z-40",
                className,
                showGradient &&
                "bg-neutral-300 dark:bg-[rgba(40,40,40,0.70)] [mask-image:radial-gradient(50%_50%_at_50%_50%,white_0%,transparent_100%)]"
            )}
        >
            {children}
        </div>
    );
};