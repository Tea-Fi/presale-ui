import { SlProgressBar } from '@shoelace-style/shoelace/dist/react';

interface IContractInfo {
  info: {
    roundSize: null | number;
    roundSold: null | number;
  };
}
const ContractInfo = ({ info }: IContractInfo) => {
  const value = info?.roundSold && info?.roundSize ? ((info?.roundSold / info.roundSize) * 100).toFixed(2) : 0;
  return (
    <div className="contract-info ">
      <div className="progress">
        <div className="progress__info">
          <p className="title">Round Available </p>
          {info.roundSize !== null && info.roundSold !== null ? (
            <p className="title">
              {(info?.roundSize - info?.roundSold).toLocaleString('en-US', { maximumFractionDigits: 4 })} TEA
            </p>
          ) : (
            <p className="title">--</p>
          )}
        </div>
        <SlProgressBar indeterminate={info.roundSize === 0} className="progress__bar" value={Number(value)} />
      </div>
    </div>
  );
};

export default ContractInfo;
