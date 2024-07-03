import { Address } from "viem";
import { Address as LocalAddress } from "../utils/constants";

export type Token = {
    address: Address | LocalAddress | string,
    symbol: string,
    decimals: number,
    imageUrl?: string,
}