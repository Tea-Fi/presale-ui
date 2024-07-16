import { cn } from "../../utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Progress } from "./progress";
import Spinner from "../spinner";
import { useCountdownStore } from "../../hooks";

export const CardHoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    link: string;
    value?: number,
    max?: number,
  }[];
  className?: string;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { isFinished } = useCountdownStore();

  return (
    <div
      className={cn(
        "flex flex-wrap py-10",
        className
      )}
    >
      {items.map((item, idx) => (
        <a
          href={isFinished ? '#' : item?.link}
          key={idx}
          className={cn("relative group block p-2 h-full w-full", isFinished ? 'cursor-not-allowed' : '')}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-slate-800/80 block  rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>

            <div className="flex flex-col gap-3 mt-4">
              <div className="inline-flex justify-between text-zinc-400 text-sm">
                <span>{item.value == null ? <Spinner/> : `${parseFloat((item.value / (item.max ?? 100) * 100).toFixed(2))}%`}</span>
                <span>{item.max == null ? <Spinner/> : `100%`}</span>
              </div>

              <Progress value={item.value}  max={item.max}/>
            </div>
          </Card>
        </a>
      ))}
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
        "rounded-2xl h-full w-full p-4 overflow-hidden bg-black border border-transparent dark:border-white/[0.2] group-hover:border-slate-700 relative z-20",
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};
export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4 className={cn("text-zinc-100 font-bold tracking-wide mt-4", className)}>
      {children}
    </h4>
  );
};
export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
        <p
            className={cn(
                "mt-8 text-zinc-400 tracking-wide leading-relaxed text-sm",
                className
            )}
        >
        {children}
        </p>
    );
};
