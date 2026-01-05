"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { UserGuard } from "@/components/user/user-guard";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard as CreditCardIcon,
  Calendar,
  Plus,
  ArrowRight,
  PieChart,
  Gem,
  Target,
  Banknote,
  AlertCircle,
} from "lucide-react";
import { getExpenses, getSubscriptions, getDebtSummary, getDebts, getIncomeSummary } from "@/lib/api";
import { getInvestments } from "@/lib/api/investments";
import { getMarketPricesAsync, convertToTRY } from "@/lib/api/market-data";
import { useUser } from "@/contexts/user-context";
import type { Expense, Subscription, DebtSummary, Debt, IncomeSummary } from "@/lib/types";
import type { Investment, MarketPrice } from "@/lib/types/investments";
import {
  formatDateShort,
  formatRelativeTime,
  calculateTotalExpenses,
  calculateMonthlyRecurring,
  calculateYearlyRecurring,
  getUpcomingSubscriptions,
} from "@/lib/utils/format";
import { filterByDateRange, groupByCategory } from "@/lib/utils/analytics";
import { useFormatCurrency } from "@/lib/hooks/use-format-currency";
import { cn } from "@/lib/utils";

function DashboardContent() {
  const { user } = useUser();
  const { formatCurrency } = useFormatCurrency();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [marketPrices, setMarketPrices] = useState<Map<string, MarketPrice>>(
    new Map()
  );
  const [debtSummary, setDebtSummary] = useState<DebtSummary | null>(null);
  const [upcomingDebts, setUpcomingDebts] = useState<Debt[]>([]);
  const [incomeSummary, setIncomeSummary] = useState<IncomeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userId = user.id;

    async function fetchData() {
      try {
        setLoading(true);
        const [expensesData, subscriptionsData, investmentsData, debtSummaryData, debtsData, incomeSummaryData] =
          await Promise.all([
            getExpenses(userId),
            getSubscriptions(userId),
            getInvestments(userId).catch(() => []),
            getDebtSummary(userId).catch(() => null),
            getDebts(userId).catch(() => []),
            getIncomeSummary(userId).catch(() => null),
          ]);
        setExpenses(Array.isArray(expensesData) ? expensesData : []);
        setSubscriptions(
          Array.isArray(subscriptionsData) ? subscriptionsData : []
        );
        setInvestments(Array.isArray(investmentsData) ? investmentsData : []);
        setDebtSummary(debtSummaryData);
        setUpcomingDebts((Array.isArray(debtsData) ? debtsData : []).filter((d: Debt) => d.status === 'active').slice(0, 3));
        setIncomeSummary(incomeSummaryData);

        // Fetch market prices for investments
        if (investmentsData.length > 0) {
          const symbols = investmentsData.map((inv: Investment) => inv.symbol);
          const prices = await getMarketPricesAsync([...new Set(symbols)]);
          setMarketPrices(prices);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  // Calculate portfolio summary
  const portfolioSummary = useMemo(() => {
    let totalValue = 0;
    let totalCost = 0;
    let topGainer: { name: string; profit: number; percent: number } | null =
      null;
    let topLoser: { name: string; loss: number; percent: number } | null = null;

    for (const inv of investments) {
      const marketPrice = marketPrices.get(inv.symbol);
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
      const profit = value - cost;
      const profitPercent = cost > 0 ? (profit / cost) * 100 : 0;

      totalValue += value;
      totalCost += cost;

      if (profit > 0 && (!topGainer || profit > topGainer.profit)) {
        topGainer = { name: inv.name, profit, percent: profitPercent };
      }
      if (profit < 0 && (!topLoser || profit < topLoser.loss)) {
        topLoser = { name: inv.name, loss: profit, percent: profitPercent };
      }
    }

    return {
      totalValue,
      totalCost,
      totalProfitLoss: totalValue - totalCost,
      totalProfitLossPercent:
        totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
      topGainer,
      topLoser,
    };
  }, [investments, marketPrices]);

  // This month expenses
  const thisMonthExpenses = useMemo(() => {
    return filterByDateRange(expenses, "this-month");
  }, [expenses]);

  const thisMonthTotal = useMemo(() => {
    return thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [thisMonthExpenses]);

  // Category breakdown
  const categoryData = useMemo(() => {
    return groupByCategory(thisMonthExpenses).slice(0, 3);
  }, [thisMonthExpenses]);

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

  const totalExpenses = calculateTotalExpenses(expenses);
  const monthlyRecurring = calculateMonthlyRecurring(subscriptions);
  const yearlyRecurring = calculateYearlyRecurring(subscriptions);
  const activeSubscriptions = (subscriptions || []).filter(
    (sub) => sub.active
  ).length;
  const recentExpenses = (expenses || [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);
  const upcomingSubscriptions = getUpcomingSubscriptions(subscriptions, 5);
  const isPortfolioPositive = portfolioSummary.totalProfitLoss >= 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Finansal durumunuzu tek bakışta görün
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/expenses">
              <Plus className="h-4 w-4 mr-2" />
              Gider Ekle
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/investments">
              <Plus className="h-4 w-4 mr-2" />
              Yatırım Ekle
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Bu Ay Harcama"
          value={formatCurrency(thisMonthTotal, "TRY")}
          description={`${thisMonthExpenses.length} işlem`}
          icon={Calendar}
          variant="gradient"
        />
        <StatsCard
          title="Toplam Gider"
          value={formatCurrency(totalExpenses, "TRY")}
          description={`${expenses.length} gider`}
          icon={TrendingUp}
        />
        <StatsCard
          title="Aylık Abonelik"
          value={formatCurrency(monthlyRecurring, "TRY")}
          description={`${activeSubscriptions} aktif`}
          icon={CreditCardIcon}
        />
        <StatsCard
          title="Yıllık Tekrarlayan"
          value={formatCurrency(yearlyRecurring, "TRY")}
          icon={Wallet}
        />
      </div>

      {/* Debt & Income Summary Row */}
      {(debtSummary || incomeSummary) && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* This Month Income */}
          <Card className="border-2 hover:border-emerald-500/30 bg-gradient-to-br from-background to-emerald-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Banknote className="h-4 w-4 text-emerald-500" />
                Bu Ay Gelir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-500">
                +{formatCurrency(incomeSummary?.this_month_income || 0, "TRY")}
              </p>
              {incomeSummary?.monthly_recurring ? (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(incomeSummary.monthly_recurring, "TRY")} düzenli gelir
                </p>
              ) : null}
              <Button asChild variant="ghost" size="sm" className="mt-2 -ml-2">
                <Link href="/incomes">
                  Detayları Gör
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Total Debt */}
          <Card className="border-2 hover:border-red-500/30 bg-gradient-to-br from-background to-red-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Toplam Borç
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-500">
                {formatCurrency(debtSummary?.total_debt || 0, "TRY")}
              </p>
              {debtSummary?.total_monthly_payment ? (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(debtSummary.total_monthly_payment, "TRY")} aylık taksit
                </p>
              ) : null}
              <Button asChild variant="ghost" size="sm" className="mt-2 -ml-2">
                <Link href="/debts">
                  Detayları Gör
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Net Status */}
          {incomeSummary && debtSummary && (
            <Card className={cn(
              "border-2",
              (incomeSummary.this_month_income - (thisMonthTotal + (debtSummary?.total_monthly_payment || 0))) >= 0
                ? "hover:border-emerald-500/30 bg-gradient-to-br from-background to-emerald-500/5"
                : "hover:border-red-500/30 bg-gradient-to-br from-background to-red-500/5"
            )}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-brand" />
                  Bu Ay Net Durum
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const net = incomeSummary.this_month_income - (thisMonthTotal + (debtSummary?.total_monthly_payment || 0));
                  const isPositive = net >= 0;
                  return (
                    <>
                      <p className={cn("text-2xl font-bold", isPositive ? "text-emerald-500" : "text-red-500")}>
                        {isPositive ? "+" : ""}{formatCurrency(net, "TRY")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Gelir - (Gider + Taksit)
                      </p>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Portfolio + Budget Row */}
      {investments.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Portfolio Value */}
          <Card className="border-2 hover:border-brand/30 bg-gradient-to-br from-background to-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Gem className="h-4 w-4 text-amber-500" />
                Portföy Değeri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-mono">
                {formatCurrency(portfolioSummary.totalValue, "TRY")}
              </p>
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-medium mt-1",
                  isPortfolioPositive ? "text-emerald-500" : "text-red-500"
                )}
              >
                {isPortfolioPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {isPortfolioPositive ? "+" : ""}
                  {formatCurrency(portfolioSummary.totalProfitLoss, "TRY")}
                </span>
                <span className="text-xs">
                  ({isPortfolioPositive ? "+" : ""}
                  {portfolioSummary.totalProfitLossPercent.toFixed(2)}%)
                </span>
              </div>
              <Button asChild variant="ghost" size="sm" className="mt-3 -ml-2">
                <Link href="/investments">
                  Detayları Gör
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Top Gainer */}
          {portfolioSummary.topGainer && (
            <Card className="border-2 hover:border-emerald-500/30 bg-gradient-to-br from-background to-emerald-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  En Çok Kazandıran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold truncate">
                  {portfolioSummary.topGainer.name}
                </p>
                <p className="text-emerald-500 font-medium">
                  +{formatCurrency(portfolioSummary.topGainer.profit, "TRY")}
                  <span className="text-sm ml-1">
                    (+{portfolioSummary.topGainer.percent.toFixed(2)}%)
                  </span>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Top Category or Top Loser */}
          {categoryData.length > 0 ? (
            <Card className="border-2 hover:border-brand/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-brand" />
                  En Çok Harcama
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">{categoryData[0].category}</p>
                <p className="text-muted-foreground">
                  {formatCurrency(categoryData[0].amount, "TRY")}
                  <span className="text-sm ml-1">
                    (%{categoryData[0].percentage.toFixed(0)})
                  </span>
                </p>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="mt-2 -ml-2"
                >
                  <Link href="/reports">
                    Raporları Gör
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : portfolioSummary.topLoser ? (
            <Card className="border-2 hover:border-red-500/30 bg-gradient-to-br from-background to-red-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  En Çok Kaybettiren
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold truncate">
                  {portfolioSummary.topLoser.name}
                </p>
                <p className="text-red-500 font-medium">
                  {formatCurrency(portfolioSummary.topLoser.loss, "TRY")}
                  <span className="text-sm ml-1">
                    ({portfolioSummary.topLoser.percent.toFixed(2)}%)
                  </span>
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      {/* Recent Expenses & Upcoming Subscriptions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Expenses */}
        <Card className="border-2 hover:border-brand/30">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-xl font-bold">Son Giderler</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Son eklenen giderleriniz
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="group">
              <Link href="/expenses">
                Tümünü Gör
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentExpenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Henüz gider eklenmemiş</p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link href="/expenses">İlk Gideri Ekle</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-brand/30 hover:bg-muted/50 transition-all duration-200 group cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate group-hover:text-brand transition-colors">
                        {expense.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium"
                        >
                          {expense.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDateShort(expense.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                        {formatCurrency(expense.amount, expense.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Subscriptions */}
        <Card className="border-2 hover:border-brand/30">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-xl font-bold">
                Yakında Yenilenecekler
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Yaklaşan ödeme tarihleri
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="group">
              <Link href="/subscriptions">
                Tümünü Gör
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingSubscriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Henüz abonelik eklenmemiş</p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link href="/subscriptions">İlk Aboneliği Ekle</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSubscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-brand/30 hover:bg-muted/50 transition-all duration-200 group cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate group-hover:text-brand transition-colors">
                        {subscription.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge
                          variant={
                            subscription.active ? "success" : "secondary"
                          }
                          className="text-xs font-medium"
                        >
                          {subscription.billing_period === "monthly"
                            ? "Aylık"
                            : "Yıllık"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(subscription.next_billing_at)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                        {formatCurrency(
                          subscription.amount,
                          subscription.currency
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-2">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button asChild variant="outline" size="sm">
              <Link href="/reports">
                <PieChart className="h-4 w-4 mr-2" />
                Raporlar
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/investments">
                <Gem className="h-4 w-4 mr-2" />
                Yatırımlar
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/expenses">
                <TrendingUp className="h-4 w-4 mr-2" />
                Tüm Giderler
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/subscriptions">
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Abonelikler
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <UserGuard>
      <DashboardContent />
    </UserGuard>
  );
}
