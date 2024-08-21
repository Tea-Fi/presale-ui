export function parseHumanReadable(
  value: bigint,
  decimals: number = 18,
  accurancy: number = 0,
): number {
  if (value == 0n) {
    return 0;
  } else if (decimals == 0) {
    return Number(value);
  }

  const accurancyNormal = accurancy > decimals ? decimals : accurancy;
  const divisionWithAcc = value / BigInt(10 ** (decimals - accurancyNormal));

  return Number(divisionWithAcc) / 10 ** accurancyNormal;
}
