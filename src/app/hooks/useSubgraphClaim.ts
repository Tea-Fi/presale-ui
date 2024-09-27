// claimsHook.ts
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react/hooks";

interface Claim {
  id: string;
  token: string;
  from: string;
  amountGet: string;
  blockTimestamp: string;
}

interface ClaimsResponse {
  claims?: Claim[];
}

export const CLAIMS_QUERY = gql`
  query claims($from: Bytes!, $token: Bytes!) {
    claims(from: $from, token: $token) {
      id
      token
      from
      amountGet
      blockTimestamp
    }
  }
`;

export const useSubgraphClaim = (
  tokenAddress?: `0x${string}`,
  fromAddress?: `0x${string}`,
) => {
  const data = useQuery<ClaimsResponse>(CLAIMS_QUERY, {
    variables: { from: fromAddress, token: tokenAddress },
  });

  console.log(data);

  return data;
};
