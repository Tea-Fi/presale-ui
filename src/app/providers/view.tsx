import { FC } from "react";
import { ConnectProvider } from "./connect-provider";
import { QueryProvider } from "./query-provider";
import { EventModalProvider } from "./event.context";
import { WalletProvider } from "./wallet.context";
import { UserContextProvider } from "./user.context";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "../utils/apollo";

type Props = {
  children: React.ReactNode;
};

export const Provider: FC<Props> = ({ children }) => {
  return (
    <QueryProvider>
      <ConnectProvider>
        <EventModalProvider>
          <WalletProvider>
            <ApolloProvider client={apolloClient}>
              <UserContextProvider>{children}</UserContextProvider>
            </ApolloProvider>
          </WalletProvider>
        </EventModalProvider>
      </ConnectProvider>
    </QueryProvider>
  );
};
