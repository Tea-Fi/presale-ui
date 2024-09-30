import { gql, useQuery } from "@apollo/client";

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
  query claims($from: String!, $token: String!) {
    claims(where: { from: $from, token: $token }) {
      id
      token
      from
      amountGet
      blockTimestamp
    }
  }
`;

export const useSubgraphClaim = (
  from?: `0x${string}`,
  token?: `0x${string}`
) => {
  const data = useQuery<ClaimsResponse>(CLAIMS_QUERY, {
    variables: { from, token },
  });

  return data;
};
