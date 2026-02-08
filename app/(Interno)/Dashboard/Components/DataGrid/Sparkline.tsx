import React, { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { useDeviceHistory } from "../../../_lib/hooks/useDeviceHistory";

interface SparklineProps {
  topic: string;
  color?: string;
}

export function Sparkline({ topic, color = "#3b82f6" }: SparklineProps) {
  // Hook centralizado remove a complexidade de acesso a dados
  const { history, isLoading } = useDeviceHistory(topic, 30);

  const data = useMemo(() => {
    return history.map((item) => {
      // Estratégia simples: Plota a primeira métrica que encontrar no objeto de telemetria
      const keys = Object.keys(item.telemetry);
      const val = keys.length > 0 ? item.telemetry[keys[0]] : 0;
      return { val };
    });
  }, [history]);

  if (isLoading || data.length === 0) {
    return <div className="w-24 h-8 bg-gray-50 rounded" />;
  }

  return (
    <div className="w-24 h-10">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <YAxis domain={["dataMin", "dataMax"]} hide />
          <Area
            type="monotone"
            dataKey="val"
            stroke={color}
            fill={color}
            fillOpacity={0.2}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export const SparklineMemo = React.memo(Sparkline);
