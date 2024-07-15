import { create } from 'zustand';

interface Store {
	isFinished: boolean;
	setFinished: (status: boolean) => void;
}

export const useCountdownStore = create<Store>(set => ({
	isFinished: false,
	setFinished: (status: boolean) => set({ isFinished: status }),
}));
