import { SlCard } from '@shoelace-style/shoelace/dist/react';
import teaToken from '../../assets/icons/tea-logo.svg';

export const TokenRate = () => {
  return (
    <SlCard slot="header" className="token-rate">
      <div className="token-rate__name">
        <img className="token-rate__logo" src={teaToken} alt="TEA" />
        Tea
      </div>
      {/* {tokenPrice !== null ? (
        <SlFormatNumber
          className="token-rate__value"
          value={tokenPrice}
          type="currency"
          currency="USD"
          maximumFractionDigits={4}
        />
      ) : (
        <Spinner />
      )} */}
    </SlCard>
  );
};
