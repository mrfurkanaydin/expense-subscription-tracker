"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceTicker } from "./price-ticker";
import { SparklineChart } from "./sparkline-chart";
import { Trash2, Pencil, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Investment,
  MarketPrice,
  InvestmentType,
} from "@/lib/types/investments";
import {
  INVESTMENT_TYPE_LABELS,
  INVESTMENT_TYPE_ICONS,
  INVESTMENT_TYPE_COLORS,
} from "@/lib/types/investments";
import { useFormatCurrency } from "@/lib/hooks/use-format-currency";
import { generateSparklineData, convertToTRY } from "@/lib/api/market-data";

interface InvestmentCardProps {
  investment: Investment;
  marketPrice?: MarketPrice;
  onEdit?: (investment: Investment) => void;
  onDelete?: (id: string) => void;
  index?: number;
}

export function InvestmentCard({
  investment,
  marketPrice,
  onEdit,
  onDelete,
  index = 0,
}: InvestmentCardProps) {
  const { formatCurrency } = useFormatCurrency();

  // Calculate values
  const currentPrice = marketPrice?.price || investment.purchase_price;
  const currentPriceTRY = convertToTRY(
    currentPrice,
    marketPrice?.currency || investment.purchase_currency
  );
  const purchasePriceTRY = convertToTRY(
    investment.purchase_price,
    investment.purchase_currency
  );

  const currentValue = investment.quantity * currentPriceTRY;
  const totalCost = investment.quantity * purchasePriceTRY;
  const profitLoss = currentValue - totalCost;
  const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

  const isPositive = profitLoss >= 0;
  const typeColor = INVESTMENT_TYPE_COLORS[investment.type as InvestmentType];

  // Generate sparkline data
  const sparklineData = useMemo(() => {
    return generateSparklineData(currentPrice);
  }, [currentPrice]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="group relative overflow-hidden border-2 hover:border-brand/30 transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
        {/* Type color accent */}
        <div
          className="absolute top-0 left-0 w-1 h-full"
          style={{ backgroundColor: typeColor }}
        />

        <CardContent className="p-4 pl-5">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Symbol & Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">
                  {INVESTMENT_TYPE_ICONS[investment.type as InvestmentType]}
                </span>
                <span className="font-mono font-bold text-lg tracking-tight">
                  {investment.symbol}
                </span>
                <Badge variant="secondary" className="text-xs font-medium">
                  {INVESTMENT_TYPE_LABELS[investment.type as InvestmentType]}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground truncate mb-2">
                {investment.name}
              </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  Miktar:{" "}
                  <span className="font-medium text-foreground">
                    {investment.quantity}
                  </span>
                </span>
                <span>
                  Alış:{" "}
                  <span className="font-medium text-foreground">
                    {formatCurrency(
                      investment.purchase_price,
                      investment.purchase_currency
                    )}
                  </span>
                </span>
              </div>
            </div>

            {/* Center: Sparkline */}
            <div className="hidden sm:block w-24">
              <SparklineChart data={sparklineData} height={40} />
            </div>

            {/* Right: Current Value & P/L */}
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-muted-foreground mb-0.5">
                Güncel Değer
              </p>
              <p className="font-mono font-bold text-xl">
                {formatCurrency(currentValue, "TRY")}
              </p>

              {/* Profit/Loss */}
              <div
                className={cn(
                  "flex items-center justify-end gap-1 text-sm font-medium mt-1",
                  isPositive ? "text-emerald-500" : "text-red-500"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {formatCurrency(profitLoss, "TRY")}
                </span>
                <span className="text-xs">
                  ({isPositive ? "+" : ""}
                  {profitLossPercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 flex gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(investment)}
                >
                  <Pencil className="h-4 w-4 text-muted-foreground hover:text-brand" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(investment.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
