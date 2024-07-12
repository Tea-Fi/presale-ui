import { create } from 'zustand';

interface CountdownStore {
	isFinished: boolean;
	setFinished: (status: boolean) => void;
}

export const useCountdownStore = create<CountdownStore>(set => ({
	isFinished: false,
	setFinished: (status: boolean) => set({ isFinished: status }),
}));
