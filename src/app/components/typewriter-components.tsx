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
      <TypewriterEffect words={words} />
      <p className="mt-[60px] text-[16px] md:text-[24px] text-[#A09BB6] max-w-[580px] text-center">
        Tea-Fi is on a mission to simplify DeFi, by fostering an intuitive and
        seamless ecosystem
      </p>
    </div>
  );
}
