import {
	QueryClient,
	QueryClientConfig,
	QueryClientProvider
} from '@tanstack/react-query';

const config: QueryClientConfig = {
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false
		}
	}
};

const queryClient = new QueryClient(config);

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
};
