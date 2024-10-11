import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import dayjs from "dayjs";

interface Props {
  min: number;
  max: number;
  months: number;
  dateStart: Date;
}

export const VestingChart = ({ min, max, months, dateStart }: Props) => {
  const data = useMemo(() => {
    type Item = { time: string; Tokens: number };

    const items = [] as Item[];

    const perMonth = (max - min) / months;

    for (let i = 0; i <= months; i++) {
      items.push({
        time: dayjs(dateStart).add(i, "months").format("MM/YY"),
        Tokens: Number((min + perMonth * i).toFixed(2)),
      });
    }

    return items;
  }, [min, max, months]);

  return (
    <div className="mt-4 mb-4">
      <LineChart
        width={222}
        height={128}
        data={data}
        margin={{
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
        }}
      >
        <XAxis dataKey="time" />
        <YAxis key="Tokens" domain={["dataMin", "dataMax"]} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="Tokens"
          stroke="rgb(247, 22, 162)"
          dot={false}
        />
      </LineChart>
    </div>
  );
};
