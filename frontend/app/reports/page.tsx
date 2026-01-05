"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";
import { UserGuard } from "@/components/user/user-guard";
import { CategoryPieChart } from "@/components/reports/category-pie-chart";
import { MonthlyBarChart } from "@/components/reports/monthly-bar-chart";
import { TrendLineChart } from "@/components/reports/trend-line-chart";
import { SubscriptionCostChart } from "@/components/reports/subscription-cost-chart";
import { DateRangePicker } from "@/components/reports/date-range-picker";
import { ExportButtons } from "@/components/reports/export-buttons";
import {
  BudgetForm,
  BudgetProgress,
  useBudget,
} from "@/components/reports/budget-manager";
import { useUser } from "@/contexts/user-context";
import { getExpenses, getSubscriptions, getDebtSummary } from "@/lib/api";
import type { Expense, Subscription, DateRange, DebtSummary } from "@/lib/types";
import { DATE_RANGE_OPTIONS } from "@/lib/constants";
import {
  filterByDateRange,
  groupByCategory,
  groupByMonth,
  calculateTrendData,
  calculateReportSummary,
} from "@/lib/utils/analytics";
import { useFormatCurrency } from "@/lib/hooks/use-format-currency";
import {
  TrendingUp,
  PieChart,
  BarChart3,
  Wallet,
  Target,
  Settings,
} from "lucide-react";
import { AlertCircle, TrendingDown } from "lucide-react";

function ReportsContent() {
  const { user } = useUser();
  const { formatCurrency } = useFormatCurrency();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debtSummary, setDebtSummary] = useState<DebtSummary | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("this-month");
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  const { budget, saveBudget, monthLabel } = useBudget();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const [expensesData, subscriptionsData, debtSummaryData] = await Promise.all([
          getExpenses(user!.id),
          getSubscriptions(user!.id),
          getDebtSummary(user!.id).catch(() => null),
        ]);
        setExpenses(Array.isArray(expensesData) ? expensesData : []);
        setSubscriptions(
          Array.isArray(subscriptionsData) ? subscriptionsData : []
        );
        setDebtSummary(debtSummaryData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  // Memoized calculations
  const filteredExpenses = useMemo(
    () => filterByDateRange(expenses, dateRange),
    [expenses, dateRange]
  );

  const categoryData = useMemo(
    () => groupByCategory(filteredExpenses),
    [filteredExpenses]
  );

  const monthlyData = useMemo(
    () => groupByMonth(expenses, subscriptions, 6),
    [expenses, subscriptions]
  );

  const trendData = useMemo(
    () => calculateTrendData(filteredExpenses, dateRange),
    [filteredExpenses, dateRange]
  );

  const summary = useMemo(
    () => calculateReportSummary(filteredExpenses, subscriptions),
    [filteredExpenses, subscriptions]
  );

  const dateRangeLabel = useMemo(() => {
    return (
      DATE_RANGE_OPTIONS.find((opt) => opt.value === dateRange)?.label ||
      "Tüm Zamanlar"
    );
  }, [dateRange]);

  // Current month expenses for budget
  const currentMonthExpenses = useMemo(() => {
    return filterByDateRange(expenses, "this-month").reduce(
      (sum, e) => sum + e.amount,
      0
    );
  }, [expenses]);

  const handleBudgetSave = (value: number) => {
    saveBudget(value);
    setShowBudgetForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600">Hata: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Raporlar
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Finansal durumunuzu analiz edin
          </p>
        </div>
        <ExportButtons
          expenses={filteredExpenses}
          subscriptions={subscriptions}
          summary={summary}
          categoryData={categoryData}
          dateRangeLabel={dateRangeLabel}
        />
      </div>

      {/* Date Range Picker */}
      <Card>
        <CardContent className="pt-6">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Dönem Gideri"
          value={formatCurrency(summary.totalExpenses, "TRY")}
          description={`${summary.expenseCount} gider`}
          icon={TrendingUp}
          variant="gradient"
        />
        <StatsCard
          title="Ortalama Aylık"
          value={formatCurrency(summary.averageMonthlyExpense, "TRY")}
          icon={BarChart3}
        />
        <StatsCard
          title="En Yüksek Kategori"
          value={summary.topCategory}
          description={formatCurrency(summary.topCategoryAmount, "TRY")}
          icon={PieChart}
        />
        <StatsCard
          title="Yıllık Abonelik"
          value={formatCurrency(summary.totalSubscriptions, "TRY")}
          icon={Wallet}
        />
      </div>

      {/* Budget Section */}
      <Card className="border-2 hover:border-brand/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Target className="h-5 w-5 text-brand" />
              Bütçe Takibi
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{monthLabel}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBudgetForm(!showBudgetForm)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {showBudgetForm ? (
            <BudgetForm
              onSave={handleBudgetSave}
              onCancel={() => setShowBudgetForm(false)}
              currentBudget={budget || undefined}
            />
          ) : budget ? (
            <BudgetProgress budget={budget} spent={currentMonthExpenses} />
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-3">
                Bu ay için bütçe belirlenmemiş
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBudgetForm(true)}
              >
                <Target className="h-4 w-4 mr-2" />
                Bütçe Belirle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debt Summary Section */}
      {debtSummary && debtSummary.total_debt > 0 && (
        <Card className="border-2 hover:border-red-500/30 bg-gradient-to-r from-red-500/5 to-orange-500/5">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Borç Durumu
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Taksitli borçlarınızın özeti
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-muted-foreground font-medium">Toplam Borç</p>
                <p className="text-xl font-bold text-red-500 mt-1">
                  {formatCurrency(debtSummary.total_debt, "TRY")}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-muted-foreground font-medium">Aylık Taksit</p>
                <p className="text-xl font-bold text-amber-500 mt-1">
                  {formatCurrency(debtSummary.total_monthly_payment, "TRY")}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-muted-foreground font-medium">Aktif Borç</p>
                <p className="text-xl font-bold text-blue-500 mt-1">
                  {debtSummary.active_debts_count} adet
                </p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-muted-foreground font-medium">İlerleme</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{debtSummary.paid_installments} / {debtSummary.total_installments} taksit</span>
                    <span className="font-medium text-emerald-500">
                      %{debtSummary.total_installments > 0
                        ? Math.round((debtSummary.paid_installments / debtSummary.total_installments) * 100)
                        : 0}
                    </span>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all"
                      style={{
                        width: `${debtSummary.total_installments > 0
                          ? (debtSummary.paid_installments / debtSummary.total_installments) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Pie Chart */}
        <Card className="border-2 hover:border-brand/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <PieChart className="h-5 w-5 text-brand" />
              Kategori Dağılımı
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {dateRangeLabel} için harcama dağılımı
            </p>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={categoryData} />
          </CardContent>
        </Card>

        {/* Subscription Cost Chart */}
        <Card className="border-2 hover:border-brand/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-brand" />
              Abonelik Maliyetleri
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Aktif aboneliklerin maliyeti
            </p>
          </CardHeader>
          <CardContent>
            <SubscriptionCostChart subscriptions={subscriptions} />
          </CardContent>
        </Card>
      </div>

      {/* Monthly Bar Chart - Full Width */}
      <Card className="border-2 hover:border-brand/30">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-brand" />
            Aylık Harcama Karşılaştırması
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Son 6 aylık gider ve abonelik dağılımı
          </p>
        </CardHeader>
        <CardContent>
          <MonthlyBarChart data={monthlyData} />
        </CardContent>
      </Card>

      {/* Trend Line Chart - Full Width */}
      <Card className="border-2 hover:border-brand/30">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand" />
            Harcama Trendi
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {dateRangeLabel} için kümülatif harcama
          </p>
        </CardHeader>
        <CardContent>
          <TrendLineChart data={trendData} budget={budget || undefined} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <UserGuard>
      <ReportsContent />
    </UserGuard>
  );
}
