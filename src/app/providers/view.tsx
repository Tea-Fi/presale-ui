import { FC } from 'react';
import { ConnectProvider } from './connect-provider';
import { QueryProvider } from './query-provider';
import { EventModalProvider } from './event.context';
import { WalletProvider } from './wallet.context';
import { UserContextProvider } from './user.context';

type Props = {
	children: React.ReactNode;
};

export const Provider: FC<Props> = ({ children }) => {
	return (
		<QueryProvider>
			<ConnectProvider>
                <EventModalProvider>
                    <WalletProvider>
                        <UserContextProvider>
                            {children}
                        </UserContextProvider>
                    </WalletProvider>
                </EventModalProvider>
            </ConnectProvider>
		</QueryProvider>
	);
};
