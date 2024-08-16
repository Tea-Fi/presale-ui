import { create } from 'zustand';

interface Store {
	isOpened: boolean;
	setOpened: (status: boolean) => void;
}

export const useMobileMenuDrawer = create<Store>(set => ({
	isOpened: false,
	setOpened: (status: boolean) => set({ isOpened: status }),
}));
