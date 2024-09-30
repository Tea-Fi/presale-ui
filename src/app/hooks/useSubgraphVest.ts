// claimsHook.ts
import { gql, useQuery } from "@apollo/client";

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

export const useSubgraphVest = (from?: `0x${string}`, token?: `0x${string}`) =>
  useQuery<VestingsResponse>(VESTS_QUERY, {
    variables: { from, token },
  });
