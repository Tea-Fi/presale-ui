// claimsHook.ts
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react/hooks";

interface Vesting {
  token: string;
  from: string;
  amountBurn: string;
  initialUnlock: string;
  vestedUnlock: string;
  blockTimestamp: string;
}

interface VestingsResponse {
  vests: Vesting[];
}

export const VESTS_QUERY = gql`
  query Vestings($from: String!, $token: String!) {
    vests(where: { from: $from, token: $token }) {
      token
      from
      amountBurn
      initialUnlock
      vestedUnlock
      blockTimestamp
    }
  }
`;

export const useSubgraphVest = (
  tokenAddress?: `0x${string}`,
  fromAddress?: `0x${string}`,
) =>
  useQuery<VestingsResponse>(VESTS_QUERY, {
    variables: { from: fromAddress, token: tokenAddress },
  });
