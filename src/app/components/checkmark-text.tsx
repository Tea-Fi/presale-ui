import { cn } from "../utils";
import { FaCheckCircle } from "react-icons/fa";

export const CheckmarkText = ({
  text,
  isPending,
  isError,
  isSuccess,
}: {
  text?: string;
  isPending?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-5",
        isPending ? "animate-pulse" : "",
      )}
    >
      <FaCheckCircle
        className={cn(
          "text-slate-500 text-2xl",
          isSuccess ? "text-emerald-700" : isError ? "text-red-700" : "",
        )}
      />
      <span
        className={cn(
          "text-white/60",
          isSuccess ? "text-emerald-700" : isError ? "text-red-700" : "",
        )}
      >
        {text}
      </span>
    </div>
  );
};
