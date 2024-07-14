import { create } from 'zustand';

interface Store {
	isOpened: boolean;
	isAllowanceChanged: boolean;
	setOpened: (status: boolean) => void;
	setAllowanceChanged: (status: boolean) => void;
}

export const useRevokeApprovalDialog = create<Store>(set => ({
	isOpened: true,
	isAllowanceChanged: false,
	setOpened: (status: boolean) => set({ isOpened: status }),
	setAllowanceChanged: (status: boolean) => set({ isAllowanceChanged: status}),
}));
