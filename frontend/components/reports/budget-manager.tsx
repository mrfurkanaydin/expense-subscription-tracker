"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, X, Save } from "lucide-react";
import type { Budget } from "@/lib/types";
import { useFormatCurrency } from "@/lib/hooks/use-format-currency";
import { getCurrentMonthKey, formatMonthLabel } from "@/lib/utils/analytics";

interface BudgetFormProps {
  onSave: (budget: number) => void;
  onCancel?: () => void;
  currentBudget?: number;
}

export function BudgetForm({
  onSave,
  onCancel,
  currentBudget,
}: BudgetFormProps) {
  const [budget, setBudget] = useState(currentBudget?.toString() || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(budget);
    if (!isNaN(value) && value > 0) {
      onSave(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="budget" className="block text-sm font-medium mb-2">
          Aylık Bütçe (TRY)
        </label>
        <input
          id="budget"
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Örn: 15000"
          min="0"
          step="100"
          className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          <Save className="h-4 w-4 mr-2" />
          Kaydet
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            İptal
          </Button>
        )}
      </div>
    </form>
  );
}

interface BudgetProgressProps {
  budget: number;
  spent: number;
  currency?: string;
}

export function BudgetProgress({
  budget,
  spent,
  currency = "TRY",
}: BudgetProgressProps) {
  const { formatCurrency } = useFormatCurrency();

  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = Math.max(budget - spent, 0);
  const isOverBudget = spent > budget;
  const overAmount = isOverBudget ? spent - budget : 0;

  const getProgressColor = () => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-amber-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusBadge = () => {
    if (percentage >= 100)
      return { label: "Aşıldı", variant: "destructive" as const };
    if (percentage >= 80)
      return { label: "Dikkat", variant: "warning" as const };
    if (percentage >= 50)
      return { label: "Normal", variant: "secondary" as const };
    return { label: "İyi", variant: "success" as const };
  };

  const status = getStatusBadge();

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Bu Ay Harcanan</p>
          <p className="text-2xl font-bold">
            {formatCurrency(spent, currency)}
          </p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>%{percentage.toFixed(0)} kullanıldı</span>
          <span>Bütçe: {formatCurrency(budget, currency)}</span>
        </div>
      </div>

      {/* Remaining / Over */}
      <div className="pt-2 border-t border-border">
        {isOverBudget ? (
          <p className="text-sm text-red-500 font-medium">
            {formatCurrency(overAmount, currency)} bütçe aşımı!
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Kalan:{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(remaining, currency)}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

// Hook for budget management with localStorage
export function useBudget() {
  const [budget, setBudget] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const monthKey = getCurrentMonthKey();
  const storageKey = `budget_${monthKey}`;

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setBudget(parseFloat(stored));
    }
    setIsLoading(false);
  }, [storageKey]);

  const saveBudget = (value: number) => {
    localStorage.setItem(storageKey, value.toString());
    setBudget(value);
  };

  const clearBudget = () => {
    localStorage.removeItem(storageKey);
    setBudget(null);
  };

  return {
    budget,
    saveBudget,
    clearBudget,
    isLoading,
    monthLabel: formatMonthLabel(monthKey),
  };
}
