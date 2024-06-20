import { SlOption, SlSelect } from '@shoelace-style/shoelace/dist/react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

// Option 1
// 0.16$
// 10% - released at TGE
// 90% - vested linearly over 12 months

// Option 2
// 0.2$
// 20% - released at TGE
// 80% -  vested linearly over 6 months

// Option 3
// 0.24$
// 50%- released at TGE
// 50- vested linearly over 2 months

export const InvestmentOptions = ({ onChange, value }: Props) => {
  return (
    <div className="select-investment-container">
      <div className="label">Select Investment option</div>
      <SlSelect
        size="large"
        value={value}
        onSlInput={(e) => {
          onChange((e.target as HTMLSelectElement).value);
        }}
        className="select-investment"
      >
        <SlOption value={'0.16'}>0.16$</SlOption>
        <SlOption value={'0.2'}>0.2$</SlOption>
        <SlOption value={'0.24'}>0.24$</SlOption>
      </SlSelect>
    </div>
  );
};
