"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Subscription } from "@/lib/types";
import { useFormatCurrency } from "@/lib/hooks/use-format-currency";

interface SubscriptionCostChartProps {
  subscriptions: Subscription[];
  currency?: string;
}

interface ChartData {
  title: string;
  monthlyCost: number;
  yearlyCost: number;
  color: string;
  isYearly: boolean;
}

const COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

export function SubscriptionCostChart({
  subscriptions,
  currency = "TRY",
}: SubscriptionCostChartProps) {
  const { formatCurrency } = useFormatCurrency();

  const activeSubscriptions = subscriptions.filter((sub) => sub.active);

  if (activeSubscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Aktif abonelik bulunamadı
      </div>
    );
  }

  const chartData: ChartData[] = activeSubscriptions.map((sub, index) => {
    const isYearly = sub.billing_period === "yearly";
    const monthlyCost = isYearly ? sub.amount / 12 : sub.amount;
    const yearlyCost = isYearly ? sub.amount : sub.amount * 12;

    return {
      title:
        sub.title.length > 15 ? sub.title.substring(0, 15) + "..." : sub.title,
      monthlyCost,
      yearlyCost,
      color: COLORS[index % COLORS.length],
      isYearly,
    };
  });

  // Sort by yearly cost descending
  chartData.sort((a, b) => b.yearlyCost - a.yearlyCost);

  const totalMonthly = chartData.reduce(
    (sum, item) => sum + item.monthlyCost,
    0
  );
  const totalYearly = chartData.reduce((sum, item) => sum + item.yearlyCost, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as ChartData;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm">{item.title}</p>
          <p className="text-sm text-muted-foreground">
            Aylık: {formatCurrency(item.monthlyCost, currency)}
          </p>
          <p className="text-sm text-muted-foreground">
            Yıllık: {formatCurrency(item.yearlyCost, currency)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {item.isYearly ? "Yıllık faturalandırma" : "Aylık faturalandırma"}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex gap-4 justify-center text-sm">
        <div className="text-center">
          <p className="text-muted-foreground">Aylık Toplam</p>
          <p className="font-bold text-lg text-brand">
            {formatCurrency(totalMonthly, currency)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">Yıllık Toplam</p>
          <p className="font-bold text-lg text-brand">
            {formatCurrency(totalYearly, currency)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            type="number"
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            type="category"
            dataKey="title"
            tick={{ fontSize: 11 }}
            className="text-muted-foreground"
            width={75}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="monthlyCost"
            name="Aylık Maliyet"
            radius={[0, 4, 4, 0]}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
