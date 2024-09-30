import { ApolloClient, InMemoryCache } from "@apollo/client";

const apolloClient = new ApolloClient({
  uri: import.meta.env.VITE_SUBGRAPH_API_URL,
  cache: new InMemoryCache(),
});

export default apolloClient;
