import Spinner from "../components/spinner";
import { useInvestmentInfos } from "../hooks/useInvestmentInfos";
import { InvestmentInfo } from "../components/claim/investment-info";

export const Claim = () => {
  const {
    totalSoldTeaPerAccount,
    loading,
    investmentInfos,
    refetchInvestmentInfo,
  } = useInvestmentInfos();

  return (
    <div className="claim flex flex-col mx-auto">
      <h1>Claim</h1>
      <p>Token claim will be available at $TEA token's TGE</p>

      <span className="text-center">
        Total Bought: {loading ? <Spinner /> : `${totalSoldTeaPerAccount} $TEA`}
      </span>

      <div className="flex gap-4 mt-10 flex-wrap justify-center mb-4">
        {!loading &&
          investmentInfos.map((investmentInfo, index) => (
            <div key={index} className="flex flex-col gap-4 ">
              <InvestmentInfo
                investmentInfo={investmentInfo}
                refetchInvestmentInfo={refetchInvestmentInfo}
              />
            </div>
          ))}
      </div>
    </div>
  );
};
