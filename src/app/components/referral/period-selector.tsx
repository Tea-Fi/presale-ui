import React from "react";

enum PeriodFilter {
  day = '1D',
  week = '1W',
  month = '1M',
  threeMonths = '3M'
}

interface PeriodSelectorProps {
  onChange: (date: Date) => void;
}

export const DashboardPeriodSelector = (props: PeriodSelectorProps) => {
  const [periodFilter, setPeriodFilter] = React.useState<PeriodFilter>(PeriodFilter.threeMonths);

  React.useEffect(() => {
    const now = new Date();
    switch (periodFilter) {
      case PeriodFilter.day:
        now.setDate(now.getDate() - 1);
        break;

      case PeriodFilter.week:
        now.setDate(now.getDate() - 7);
        break;

      case PeriodFilter.month:
        now.setMonth(now.getMonth() - 1);
        break;

      case PeriodFilter.threeMonths:
        now.setMonth(now.getMonth() - 3);
        break;
    }

    props.onChange(now);
  }, [periodFilter])

  return (
    <div className="dashboard-filters flex flex-row gap-2">
      {Object.values(PeriodFilter).map(option => (
        <div
          key={option}
          data-selected={periodFilter === option}
          onClick={() => setPeriodFilter(option)}
        >
          {option}
        </div>
      ))}
    </div>
  )
}
