"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CURRENCIES, BILLING_PERIODS } from "@/lib/constants";
import { createSubscription } from "@/lib/api";
import type { CreateSubscriptionRequest } from "@/lib/types";

const subscriptionSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir"),
  amount: z.number().positive("Tutar pozitif olmalıdır"),
  currency: z.enum(["TRY", "USD", "EUR", "GBP"]),
  billing_period: z.enum(["monthly", "yearly"]),
  next_billing_at: z.string().min(1, "Yenileme tarihi gereklidir"),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

interface SubscriptionFormProps {
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SubscriptionForm({
  userId,
  onSuccess,
  onCancel,
}: SubscriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      currency: "TRY",
      billing_period: "monthly",
      next_billing_at: new Date().toISOString().split("T")[0],
    },
  });

  const billingPeriod = watch("billing_period");

  const onSubmit = async (data: SubscriptionFormData) => {
    try {
      setIsSubmitting(true);
      const nextBillingDate = new Date(data.next_billing_at);
      const request: CreateSubscriptionRequest = {
        user_id: userId,
        ...data,
        next_billing_at: nextBillingDate.toISOString(),
      };
      await createSubscription(request);
      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating subscription:", error);
      alert("Abonelik eklenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni Abonelik Ekle</CardTitle>
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
              placeholder="Örn: Netflix"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="billing_period"
                className="block text-sm font-medium mb-1.5"
              >
                Ödeme Periyodu
              </label>
              <select
                id="billing_period"
                {...register("billing_period")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {BILLING_PERIODS.map((period) => (
                  <option key={period} value={period}>
                    {period === "monthly" ? "Aylık" : "Yıllık"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="next_billing_at"
                className="block text-sm font-medium mb-1.5"
              >
                Sonraki Ödeme Tarihi
              </label>
              <input
                id="next_billing_at"
                type="date"
                {...register("next_billing_at")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.next_billing_at && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.next_billing_at.message}
                </p>
              )}
            </div>
          </div>

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

