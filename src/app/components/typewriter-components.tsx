"use client";
import { TypewriterEffect } from "./ui";

export function TypewriterComponent() {
    const words = [
        {
            text: "Be",
        },
        {
            text: "among",
        },
        {
            text: "the",
        },
        {
            text: "first",
        },
        {
            text: "—",
        },
        {
            text: "Tea-Fi.",
            className: "text-[#ff00a4] dark:text-[#ff00a4]",
        },
    ];
    return (
        <div className="flex flex-col items-center justify-center h-max text-white z-50 mb-1">
            <p className="text-neutral-600 dark:text-neutral-200 text-base mb-5 text-xl">
                ZK DeFi hub enhancing privacy in the crypto landscape
            </p>
            <TypewriterEffect words={words} />
        </div>
    );
}
