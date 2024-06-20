import { SlInput } from '@shoelace-style/shoelace/dist/react';
import { ComponentProps } from 'react';

type Props = {
  onChangeValue: (amount: string) => void;
} & ComponentProps<typeof SlInput>;
export const CoinInput = ({ value, onChangeValue, ...props }: Props) => {
  return (
    <SlInput
      className="amount__input"
      type="number"
      noSpinButtons
      autocomplete="off"
      valueAsNumber={Number(value) ?? undefined}
      placeholder={'0.00'}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }
      }}
      onSlInput={(e) => {
        const amount = parseFloat((e.target as HTMLInputElement).value);
        onChangeValue(String(Number.isNaN(amount) ? 0 : amount));
      }}
      inputmode="decimal"
      enterkeyhint="done"
      pattern="[0-9]*"
      {...props}
    />
  );
};
