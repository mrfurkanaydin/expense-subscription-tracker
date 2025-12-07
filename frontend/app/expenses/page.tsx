"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { UserGuard } from "@/components/user/user-guard";
import { useUser } from "@/contexts/user-context";
import { Plus, Filter, X } from "lucide-react";
import { getExpenses, createExpense } from "@/lib/api";
import type { Expense, CreateExpenseRequest } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/lib/constants";

function ExpensesContent() {
  const { user } = useUser();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    ExpenseCategory | "all"
  >("all");

  useEffect(() => {
    if (!user) return;
    fetchExpenses();
  }, [user]);

  async function fetchExpenses() {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getExpenses(user.id);
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }

  const handleExpenseCreated = () => {
    setShowForm(false);
    fetchExpenses();
  };

  const filteredExpenses =
    selectedCategory === "all"
      ? (expenses || [])
      : (expenses || []).filter((expense) => expense.category === selectedCategory);

  const groupedByCategory = (filteredExpenses || []).reduce(
    (acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = [];
      }
      acc[expense.category].push(expense);
      return acc;
    },
    {} as Record<string, Expense[]>
  );

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
            Giderler
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Tüm giderlerinizi görüntüleyin ve yönetin
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Formu Kapat" : "Yeni Gider Ekle"}
        </Button>
      </div>

      {/* Form */}
      {showForm && user && (
        <ExpenseForm
          userId={user.id}
          onSuccess={handleExpenseCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-lg">Kategori Filtresi</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              Tümü
            </Button>
            {EXPENSE_CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={
                  selectedCategory === category ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {selectedCategory === "all"
                ? "Henüz gider eklenmemiş"
                : "Bu kategoride gider bulunamadı"}
            </p>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                İlk Gideri Ekle
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByCategory).map(([category, categoryExpenses]) => {
            if (!categoryExpenses || categoryExpenses.length === 0) return null;
            
            const categoryTotal = categoryExpenses.reduce(
              (sum, exp) => sum + (exp?.amount || 0),
              0
            );
            const currency = categoryExpenses[0]?.currency || "TRY";

            return (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge variant="secondary">{category}</Badge>
                      <span className="text-sm font-normal text-muted-foreground">
                        ({categoryExpenses.length} gider)
                      </span>
                    </CardTitle>
                    <p className="text-sm font-semibold">
                      {formatCurrency(categoryTotal, currency)}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryExpenses
                      .sort(
                        (a, b) =>
                          new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime()
                      )
                      .map((expense) => (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between p-4 rounded-xl border-2 border-border/50 hover:border-brand/30 hover:bg-gradient-to-r hover:from-brand/5 hover:to-accent/5 transition-all duration-200 group cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate group-hover:text-brand transition-colors">
                              {expense.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1.5">
                              {formatDate(expense.created_at)}
                            </p>
                          </div>
                          <div className="ml-4 text-right">
                            <p className="text-sm font-bold group-hover:text-brand transition-colors">
                              {formatCurrency(expense.amount, expense.currency)}
                            </p>
                          </div>
                        </div>
                      ))}
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

export default function ExpensesPage() {
  return (
    <UserGuard>
      <ExpensesContent />
    </UserGuard>
  );
}

