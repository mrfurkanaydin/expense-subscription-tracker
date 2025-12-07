"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";
import { UserGuard } from "@/components/user/user-guard";
import { useUser } from "@/contexts/user-context";
import { Plus, Calendar, CreditCard } from "lucide-react";
import { getSubscriptions } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Subscription } from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from "@/lib/utils/format";

function SubscriptionsContent() {
  const { user } = useUser();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    if (!user) return;
    fetchSubscriptions();
  }, [user]);

  async function fetchSubscriptions() {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getSubscriptions(user.id);
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSubscriptionCreated = () => {
    setShowForm(false);
    fetchSubscriptions();
  };

  const safeSubscriptions = subscriptions || [];
  
  const filteredSubscriptions = safeSubscriptions.filter((sub) => {
    if (filter === "active") return sub?.active === true;
    if (filter === "inactive") return sub?.active === false;
    return true;
  });

  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    if (a.active !== b.active) {
      return a.active ? -1 : 1;
    }
    return (
      new Date(a.next_billing_at).getTime() -
      new Date(b.next_billing_at).getTime()
    );
  });

  const activeSubscriptions = safeSubscriptions.filter((sub) => sub?.active === true);
  const totalMonthly = activeSubscriptions
    .filter((sub) => sub?.billing_period === "monthly")
    .reduce((sum, sub) => sum + (sub?.amount || 0), 0);
  const totalYearly = activeSubscriptions
    .filter((sub) => sub?.billing_period === "yearly")
    .reduce((sum, sub) => sum + (sub?.amount || 0), 0);

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
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Abonelikler
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Tüm aboneliklerinizi görüntüleyin ve yönetin
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Formu Kapat" : "Yeni Abonelik Ekle"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Aktif Abonelik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {activeSubscriptions.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aylık Toplam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {formatCurrency(totalMonthly, "TRY")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Yıllık Toplam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {formatCurrency(totalYearly, "TRY")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      {showForm && user && (
        <SubscriptionForm
          userId={user.id}
          onSuccess={handleSubscriptionCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              Tümü ({safeSubscriptions.length})
            </Button>
            <Button
              variant={filter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("active")}
            >
              Aktif ({activeSubscriptions.length})
            </Button>
            <Button
              variant={filter === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("inactive")}
            >
              Pasif ({safeSubscriptions.length - activeSubscriptions.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      {sortedSubscriptions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {filter === "all"
                ? "Henüz abonelik eklenmemiş"
                : filter === "active"
                  ? "Aktif abonelik bulunamadı"
                  : "Pasif abonelik bulunamadı"}
            </p>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                İlk Aboneliği Ekle
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedSubscriptions.map((subscription) => {
            const isUpcoming =
              new Date(subscription.next_billing_at).getTime() -
                new Date().getTime() <
              7 * 24 * 60 * 60 * 1000; // 7 days

            return (
              <Card
                key={subscription.id}
                className={cn(
                  "border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
                  !subscription.active
                    ? "opacity-60 border-border/50"
                    : isUpcoming
                      ? "border-warning/50 hover:border-warning shadow-warning/20"
                      : "border-border/50 hover:border-brand/30"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-bold flex-1 truncate">
                      {subscription.title}
                    </CardTitle>
                    <Badge
                      variant={
                        subscription.active
                          ? isUpcoming
                            ? "warning"
                            : "success"
                          : "secondary"
                      }
                      className="ml-2 shrink-0 font-semibold"
                    >
                      {subscription.active ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium text-muted-foreground">Tutar</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
                      {formatCurrency(
                        subscription.amount,
                        subscription.currency
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium text-muted-foreground">
                      Periyot
                    </span>
                    <Badge variant="outline" className="font-semibold">
                      {subscription.billing_period === "monthly"
                        ? "Aylık"
                        : "Yıllık"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t-2 border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-brand/10">
                        <Calendar className="h-4 w-4 text-brand" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Sonraki Ödeme
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {formatRelativeTime(subscription.next_billing_at)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(subscription.next_billing_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <UserGuard>
      <SubscriptionsContent />
    </UserGuard>
  );
}

