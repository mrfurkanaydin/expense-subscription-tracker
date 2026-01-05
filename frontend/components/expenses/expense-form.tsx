"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EXPENSE_CATEGORIES, CURRENCIES } from "@/lib/constants";
import { createExpense, getCreditCards } from "@/lib/api";
import type { CreateExpenseRequest, CreditCard } from "@/lib/types";
import { Banknote, CreditCard as CreditCardIcon, Building2 } from "lucide-react";

const expenseSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir"),
  amount: z.number().positive("Tutar pozitif olmalıdır"),
  currency: z.enum(["TRY", "USD", "EUR", "GBP"]),
  category: z.enum([
    "Yiyecek",
    "Ulaşım",
    "Alışveriş",
    "Faturalar",
    "Eğlence",
    "Sağlık",
    "Eğitim",
    "Diğer",
  ]),
  payment_method: z.enum(["cash", "debit_card", "credit_card"]),
  credit_card_id: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ExpenseForm({ userId, onSuccess, onCancel }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

  useEffect(() => {
    getCreditCards(userId).then(cards => {
      if (Array.isArray(cards)) setCreditCards(cards);
    }).catch(() => { });
  }, [userId]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      currency: "TRY",
      category: "Diğer",
      payment_method: "cash",
    },
  });

  const paymentMethod = watch("payment_method");

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      setIsSubmitting(true);
      const request: CreateExpenseRequest = {
        user_id: userId,
        title: data.title,
        amount: data.amount,
        currency: data.currency,
        category: data.category,
        payment_method: data.payment_method,
        credit_card_id: data.payment_method === "credit_card" ? data.credit_card_id : undefined,
      };
      await createExpense(request);
      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating expense:", error);
      alert("Gider eklenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni Gider Ekle</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium mb-1.5"
            >
              Başlık
            </label>
            <input
              id="title"
              {...register("title")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Örn: Market alışverişi"
            />
            {errors.title && (
              <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium mb-1.5"
              >
                Tutar
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="currency"
                className="block text-sm font-medium mb-1.5"
              >
                Para Birimi
              </label>
              <select
                id="currency"
                {...register("currency")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium mb-1.5"
            >
              Kategori
            </label>
            <select
              id="category"
              {...register("category")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ödeme Yöntemi
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === "cash"
                    ? "border-green-500 bg-green-500/10 text-green-600"
                    : "border-border hover:border-green-500/50"
                  }`}
              >
                <input
                  type="radio"
                  value="cash"
                  {...register("payment_method")}
                  className="sr-only"
                />
                <Banknote className="h-4 w-4" />
                <span className="text-xs font-medium">Nakit</span>
              </label>
              <label
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === "debit_card"
                    ? "border-blue-500 bg-blue-500/10 text-blue-600"
                    : "border-border hover:border-blue-500/50"
                  }`}
              >
                <input
                  type="radio"
                  value="debit_card"
                  {...register("payment_method")}
                  className="sr-only"
                />
                <Building2 className="h-4 w-4" />
                <span className="text-xs font-medium">Banka</span>
              </label>
              <label
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === "credit_card"
                    ? "border-purple-500 bg-purple-500/10 text-purple-600"
                    : "border-border hover:border-purple-500/50"
                  }`}
              >
                <input
                  type="radio"
                  value="credit_card"
                  {...register("payment_method")}
                  className="sr-only"
                />
                <CreditCardIcon className="h-4 w-4" />
                <span className="text-xs font-medium">Kredi</span>
              </label>
            </div>
          </div>

          {/* Credit Card Selection - Only show when credit_card is selected */}
          {paymentMethod === "credit_card" && creditCards.length > 0 && (
            <div>
              <label
                htmlFor="credit_card_id"
                className="block text-sm font-medium mb-1.5"
              >
                Kredi Kartı
              </label>
              <select
                id="credit_card_id"
                {...register("credit_card_id")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Kart seçin</option>
                {creditCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Ekleniyor..." : "Ekle"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                İptal
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}



