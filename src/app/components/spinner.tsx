import { SlSpinner } from "@shoelace-style/shoelace/dist/react";
import { cn } from "../utils";

interface SpinnerProps {
  className?: string;
}
const Spinner: React.FC<SpinnerProps> = ({ className }) => (
  <SlSpinner className={cn(className, "spinner")} />
);
export default Spinner;
