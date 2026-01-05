"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Investment,
  PortfolioSummary,
  InvestmentType,
} from "@/lib/types/investments";
import {
  INVESTMENT_TYPE_COLORS,
  INVESTMENT_TYPE_LABELS,
  INVESTMENT_TYPE_ICONS,
} from "@/lib/types/investments";
import { useFormatCurrency } from "@/lib/hooks/use-format-currency";
import { getMarketPrice, convertToTRY } from "@/lib/api/market-data";

interface PortfolioOverviewProps {
  investments: Investment[];
}

export function PortfolioOverview({ investments }: PortfolioOverviewProps) {
  const { formatCurrency } = useFormatCurrency();

  const summary = useMemo((): PortfolioSummary => {
    let totalValue = 0;
    let totalCost = 0;
    const byTypeMap = new Map<InvestmentType, number>();

    for (const inv of investments) {
      const marketPrice = getMarketPrice(inv.symbol);
      const currentPrice = marketPrice?.price || inv.purchase_price;
      const currentPriceTRY = convertToTRY(
        currentPrice,
        marketPrice?.currency || inv.purchase_currency
      );
      const purchasePriceTRY = convertToTRY(
        inv.purchase_price,
        inv.purchase_currency
      );

      const value = inv.quantity * currentPriceTRY;
      const cost = inv.quantity * purchasePriceTRY;

      totalValue += value;
      totalCost += cost;

      const currentTypeValue = byTypeMap.get(inv.type as InvestmentType) || 0;
      byTypeMap.set(inv.type as InvestmentType, currentTypeValue + value);
    }

    const totalProfitLoss = totalValue - totalCost;
    const totalProfitLossPercent =
      totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

    // Daily change simulation (in a real app, would compare with yesterday's close)
    const dailyChangePercent = (Math.random() - 0.45) * 3; // -1.5% to +1.65%
    const dailyChange = totalValue * (dailyChangePercent / 100);

    const byType = Array.from(byTypeMap.entries()).map(([type, value]) => ({
      type,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }));

    return {
      totalValue,
      totalCost,
      totalProfitLoss,
      totalProfitLossPercent,
      dailyChange,
      dailyChangePercent,
      byType,
    };
  }, [investments]);

  const isPositive = summary.totalProfitLoss >= 0;
  const isDailyPositive = summary.dailyChange >= 0;

  const pieData = summary.byType.map((item) => ({
    name: INVESTMENT_TYPE_LABELS[item.type],
    value: item.value,
    color: INVESTMENT_TYPE_COLORS[item.type],
    icon: INVESTMENT_TYPE_ICONS[item.type],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm flex items-center gap-1">
            <span>{data.icon}</span>
            {data.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value, "TRY")}
          </p>
        </div>
      );
    }
    return null;
  };

  if (investments.length === 0) {
    return (
      <Card className="border-2 bg-gradient-to-br from-background to-muted/20">
        <CardContent className="py-12 text-center">
          <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Henüz yatırım eklenmemiş</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 bg-gradient-to-br from-background via-background to-brand/5 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Wallet className="h-5 w-5 text-brand" />
          Portföy Özeti
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Total Value & P/L */}
          <div className="space-y-4">
            {/* Total Value */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm text-muted-foreground mb-1">
                Toplam Portföy Değeri
              </p>
              <p className="font-mono font-black text-4xl tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {formatCurrency(summary.totalValue, "TRY")}
              </p>
            </motion.div>

            {/* Daily Change */}
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Günlük Değişim</p>
                <div
                  className={cn(
                    "flex items-center gap-1 font-medium",
                    isDailyPositive ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {isDailyPositive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>
                    {isDailyPositive ? "+" : ""}
                    {formatCurrency(summary.dailyChange, "TRY")}
                  </span>
                  <span className="text-xs">
                    ({isDailyPositive ? "+" : ""}
                    {summary.dailyChangePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              <div className="border-l border-border pl-4">
                <p className="text-xs text-muted-foreground">
                  Toplam Kar/Zarar
                </p>
                <div
                  className={cn(
                    "flex items-center gap-1 font-medium",
                    isPositive ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>
                    {isPositive ? "+" : ""}
                    {formatCurrency(summary.totalProfitLoss, "TRY")}
                  </span>
                  <span className="text-xs">
                    ({isPositive ? "+" : ""}
                    {summary.totalProfitLossPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Investment Cost */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Toplam Maliyet:{" "}
                <span className="font-medium text-foreground">
                  {formatCurrency(summary.totalCost, "TRY")}
                </span>
              </p>
            </div>
          </div>

          {/* Right: Allocation Chart */}
          <div className="flex items-center gap-4">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                    animationDuration={800}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-1.5">
              {summary.byType.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: INVESTMENT_TYPE_COLORS[item.type],
                      }}
                    />
                    <span className="text-muted-foreground">
                      {INVESTMENT_TYPE_ICONS[item.type]}{" "}
                      {INVESTMENT_TYPE_LABELS[item.type]}
                    </span>
                  </div>
                  <span className="font-medium">
                    %{item.percentage.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
