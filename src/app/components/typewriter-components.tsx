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
        <div className="flex flex-col items-center justify-center h-max text-white z-50 m-2 mb-1">
            <p className="text-neutral-600 dark:text-neutral-200 mb-5 text-xl text-center">
                Tea-Fi is a one-stop for DeFi shop, leveraging ZK technology to enhance privacy.
            </p>
            <TypewriterEffect words={words} />
        </div>
    );
}
