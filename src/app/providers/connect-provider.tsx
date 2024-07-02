import { WagmiProvider } from 'wagmi';
import { ConnectKitProvider } from 'connectkit';
import { wagmiConfig } from '../config';

export const ConnectProvider = ({ children }: { children: React.ReactNode }) => {
	return (
		<WagmiProvider config={wagmiConfig}>
			<ConnectKitProvider>{children}</ConnectKitProvider>
		</WagmiProvider>
	);
};
