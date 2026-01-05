"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { TrendData } from "@/lib/types";
import { useFormatCurrency } from "@/lib/hooks/use-format-currency";

interface TrendLineChartProps {
  data: TrendData[];
  currency?: string;
  budget?: number;
}

export function TrendLineChart({
  data,
  currency = "TRY",
  budget,
}: TrendLineChartProps) {
  const { formatCurrency } = useFormatCurrency();

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Veri bulunamadı
      </div>
    );
  }

  // Sample data if too many points (for performance)
  const sampledData =
    data.length > 60
      ? data.filter(
          (_, i) =>
            i % Math.ceil(data.length / 60) === 0 || i === data.length - 1
        )
      : data;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          <p className="text-sm text-muted-foreground">
            Günlük: {formatCurrency(payload[0]?.payload?.amount || 0, currency)}
          </p>
          <p className="text-sm font-medium text-brand">
            Kümülatif: {formatCurrency(payload[0]?.value || 0, currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={sampledData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="dateLabel"
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="cumulative"
          stroke="#6366f1"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorCumulative)"
          animationDuration={1000}
        />
        {budget && (
          <ReferenceLine
            y={budget}
            stroke="#ef4444"
            strokeDasharray="5 5"
            label={{
              value: "Bütçe",
              position: "right",
              fill: "#ef4444",
              fontSize: 12,
            }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
