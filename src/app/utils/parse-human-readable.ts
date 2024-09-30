export function parseHumanReadable(
  value: bigint,
  decimals: number = 18,
  accuracy: number = 0
): number {
  if (value == 0n) {
    return 0;
  } else if (decimals == 0) {
    return Number(value);
  }

  const parsed = Number(value) / 10 ** decimals;

  const trimmed = parsed.toLocaleString("en-US", {
    maximumFractionDigits: accuracy,
  });

  return Number(trimmed.replaceAll(",", ""));
}
