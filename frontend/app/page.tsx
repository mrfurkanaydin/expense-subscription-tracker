"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { UserGuard } from "@/components/user/user-guard";
import {
  TrendingUp,
  Wallet,
  CreditCard,
  Calendar,
  Plus,
  ArrowRight,
} from "lucide-react";
import { getExpenses, getSubscriptions } from "@/lib/api";
import { useUser } from "@/contexts/user-context";
import type { Expense, Subscription } from "@/lib/types";
import {
  formatCurrency,
  formatDateShort,
  formatRelativeTime,
  calculateTotalExpenses,
  calculateMonthlyRecurring,
  calculateYearlyRecurring,
  getUpcomingSubscriptions,
} from "@/lib/utils/format";

function DashboardContent() {
  const { user } = useUser();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
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
        const [expensesData, subscriptionsData] = await Promise.all([
          getExpenses(userId),
          getSubscriptions(userId),
        ]);
        setExpenses(expensesData);
        setSubscriptions(subscriptionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

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

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Giderlerinizi ve aboneliklerinizi takip edin
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
            <Link href="/subscriptions">
              <Plus className="h-4 w-4 mr-2" />
              Abonelik Ekle
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Toplam Gider"
          value={formatCurrency(totalExpenses, "TRY")}
          icon={TrendingUp}
          variant="gradient"
        />
        <StatsCard
          title="Aktif Abonelik"
          value={activeSubscriptions.toString()}
          description={`${subscriptions?.length} toplam`}
          icon={CreditCard}
        />
        <StatsCard
          title="Aylık Tekrarlayan"
          value={formatCurrency(monthlyRecurring, "TRY")}
          icon={Wallet}
        />
        <StatsCard
          title="Yıllık Toplam"
          value={formatCurrency(yearlyRecurring, "TRY")}
          icon={Calendar}
        />
      </div>

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
