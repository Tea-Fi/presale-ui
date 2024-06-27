import { SlOption, SlSelect } from '@shoelace-style/shoelace/dist/react';

interface Props {
  investmentOptions: string[];
  value: string;
  onChange: (value: string) => void;
}

export const InvestmentOptions = ({ investmentOptions, onChange, value }: Props) => {
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
        {investmentOptions.map((opt: string) => (
          <SlOption value={opt}>{opt}$</SlOption>
        ))}
      </SlSelect>
    </div>
  );
};
