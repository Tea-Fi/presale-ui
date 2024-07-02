"use client";
import { TypewriterEffect } from "./ui";

export function TypewriterComponent() {
    const words = [
        {
            text: "Build",
        },
        {
            text: "awesome",
        },
        {
            text: "apps",
        },
        {
            text: "with",
        },
        {
            text: "TeaSwap.",
            className: "text-[#ff00a4] dark:text-[#ff00a4]",
        },
    ];
    return (
        <div className="flex flex-col items-center justify-center h-max text-white z-50 mb-1">
            <p className="text-neutral-600 dark:text-neutral-200 text-base mb-5 text-xl">
                The Teaswap presale is here
            </p>
            <TypewriterEffect words={words} />
        </div>
    );
}
