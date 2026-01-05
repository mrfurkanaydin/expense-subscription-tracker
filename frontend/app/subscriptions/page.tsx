"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";
import { EditSubscriptionForm } from "@/components/subscriptions/edit-subscription-form";
import { CancelSubscriptionModal } from "@/components/subscriptions/cancel-subscription-modal";
import { UserGuard } from "@/components/user/user-guard";
import { useUser } from "@/contexts/user-context";
import { Plus, Calendar, CreditCard, Pencil, Trash2, Ban } from "lucide-react";
import { getSubscriptions, deleteSubscription } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Subscription } from "@/lib/types";
import { SubscriptionCard } from "@/components/subscriptions/subscription-card";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import { useFormatCurrency } from "@/lib/hooks/use-format-currency";

function SubscriptionsContent() {
  const { user } = useUser();
  const { formatCurrency } = useFormatCurrency();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [cancelingSubscription, setCancelingSubscription] =
    useState<Subscription | null>(null);
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

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
  };

  const handleUpdateSuccess = () => {
    setEditingSubscription(null);
    fetchSubscriptions();
  };

  const handleCancel = (subscription: Subscription) => {
    setCancelingSubscription(subscription);
  };

  const handleCancelSuccess = () => {
    setCancelingSubscription(null);
    fetchSubscriptions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu aboneliği silmek istediğinize emin misiniz?")) return;

    try {
      await deleteSubscription(id);
      fetchSubscriptions();
    } catch (err) {
      alert("Silme işlemi başarısız oldu");
    }
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

  const activeSubscriptions = safeSubscriptions.filter(
    (sub) => sub?.active === true
  );
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
    <div className="space-y-6 sm:space-y-8 relative">
      {/* Cancel Modal Overlay */}
      {cancelingSubscription && (
        <CancelSubscriptionModal
          subscription={cancelingSubscription}
          onSuccess={handleCancelSuccess}
          onCancel={() => setCancelingSubscription(null)}
        />
      )}

      {/* Edit Modal Overlay */}
      {editingSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg relative z-50">
            <EditSubscriptionForm
              subscription={editingSubscription}
              onSuccess={handleUpdateSuccess}
              onCancel={() => setEditingSubscription(null)}
            />
          </div>
        </div>
      )}

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
          {sortedSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCancel={handleCancel}
            />
          ))}
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
