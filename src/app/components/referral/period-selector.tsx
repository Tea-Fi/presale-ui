import React from "react";

export enum PeriodFilter {
  day = '1D',
  week = '1W',
  month = '1M',
  threeMonths = '3M'
}

interface PeriodSelectorProps {
  onChange: (period: PeriodFilter, date: Date) => void;
}

export const DashboardPeriodSelector = (props: PeriodSelectorProps) => {
  const [periodFilter, setPeriodFilter] = React.useState<PeriodFilter>(PeriodFilter.threeMonths);

  React.useEffect(() => {
    const date = new Date();

    switch (periodFilter) {
      case PeriodFilter.day:
        date.setDate(date.getDate() - 1);
        break;

      case PeriodFilter.week:
        date.setDate(date.getDate() - 7);
        break;

      case PeriodFilter.month:
        date.setMonth(date.getMonth() - 1);
        break;

      case PeriodFilter.threeMonths:
        date.setMonth(date.getMonth() - 3);
        break;
    }

    props.onChange(periodFilter, date);
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
