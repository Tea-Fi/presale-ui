export { cn } from "./cn";
export { parseHumanReadable } from "./parse-human-readable";

export const truncateAddress = (address: string, numbersToShow = 4) => {
  if (!address) return "No Account";
  const match = address.match(
    new RegExp(
      `^(0x[a-zA-Z0-9]{${numbersToShow}})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$`
    )
  );
  if (!match) return address;
  return `${match[1]}...${match[2]}`;
};
