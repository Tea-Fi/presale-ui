import { FC } from 'react';
import { cn } from '../../utils/cn';

type Props = {
	max?: number;
	value?: number;
	className?: string;
};

export const Progress: FC<Props> = ({ max, value, className }) => {
	const ONE_HUNDRED_PERCENTS = 100;
	const MAX = max ?? ONE_HUNDRED_PERCENTS;
	const CURRENT = value ?? 0;


	const currentInPerc =
		max !== ONE_HUNDRED_PERCENTS
			? (CURRENT / MAX) * ONE_HUNDRED_PERCENTS
			: CURRENT;


	const Parentdiv = {
		backgroundImage:
			'linear-gradient(180deg, rgba(255,255,255, 0.4) 0%, rgba(138,138,138, 0.4) 82%, rgba(210,203,203, 0.1) 100%)'
	};


	const Childdiv = {
		transition: "0.2s",
		width: `${currentInPerc >= MAX ? MAX : currentInPerc}%`,
		backgroundImage: 'linear-gradient(90deg, #FFC700 0%, #00CD90 100%)'
	};

	return (
		<div
			className={cn('w-full h-3 rounded-full overflow-hidden transa', className)}
			style={Parentdiv}
		>
			<div className={`h-full rounded-full`} style={Childdiv}></div>
		</div>
	);
};