import { Address } from "viem";

export type Token = {
    address: Address,
    symbol: string,
    decimals: number,
    imageUrl?: string,
}