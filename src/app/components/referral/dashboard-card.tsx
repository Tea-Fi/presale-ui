import React from "react";

interface Props {
  title: string;
  value: string;
  icon: React.ReactNode;
}

export const DashboardBlock: React.FC<Props> = (props) => {
  return (
    <div className='dashboard-card'>
      <div className='dashboard-card__icon'>
        {props.icon}
      </div>

      <div className='dashboard-card__title'>
        {props.title}
      </div>

      <div className='dashboard-card__value'>
        {props.value}
      </div>
    </div>
  )
}