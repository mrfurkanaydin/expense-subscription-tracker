"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CURRENCIES, BILLING_PERIODS } from "@/lib/constants";
import { updateSubscription, getCreditCards } from "@/lib/api";
import type { Subscription, UpdateSubscriptionRequest, CreditCard } from "@/lib/types";

const subscriptionSchema = z.object({
    title: z.string().min(1, "Başlık gereklidir"),
    amount: z.number().positive("Tutar pozitif olmalıdır"),
    currency: z.enum(["TRY", "USD", "EUR", "GBP"]),
    billing_period: z.enum(["monthly", "yearly"]),
    next_billing_at: z.string().min(1, "Yenileme tarihi gereklidir"),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    active: z.boolean().optional(),
    credit_card_id: z.string().optional(),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

interface EditSubscriptionFormProps {
    subscription: Subscription;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function EditSubscriptionForm({
    subscription,
    onSuccess,
    onCancel,
}: EditSubscriptionFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

    useEffect(() => {
        getCreditCards(subscription.user_id).then(cards => {
            if (Array.isArray(cards)) setCreditCards(cards);
        }).catch(() => { });
    }, [subscription.user_id]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SubscriptionFormData>({
        resolver: zodResolver(subscriptionSchema),
        defaultValues: {
            title: subscription.title,
            amount: subscription.amount,
            currency: subscription.currency as any,
            billing_period: subscription.billing_period,
            next_billing_at: new Date(subscription.next_billing_at).toISOString().split("T")[0],
            start_date: subscription.start_date ? new Date(subscription.start_date).toISOString().split("T")[0] : undefined,
            end_date: subscription.end_date ? new Date(subscription.end_date).toISOString().split("T")[0] : undefined,
            active: subscription.active,
            credit_card_id: subscription.credit_card_id || "",
        },
    });

    const onSubmit = async (data: SubscriptionFormData) => {
        try {
            setIsSubmitting(true);
            const nextBillingDate = new Date(data.next_billing_at);
            const request: UpdateSubscriptionRequest = {
                id: subscription.id,
                title: data.title,
                amount: data.amount,
                currency: data.currency,
                billing_period: data.billing_period,
                next_billing_at: nextBillingDate.toISOString(),
                start_date: data.start_date ? new Date(data.start_date).toISOString() : undefined,
                end_date: data.end_date ? new Date(data.end_date).toISOString() : "",
                active: data.active,
                credit_card_id: data.credit_card_id || undefined,
            };
            await updateSubscription(request);
            onSuccess?.();
        } catch (error) {
            console.error("Error updating subscription:", error);
            alert("Abonelik güncellenirken bir hata oluştu");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Aboneliği Düzenle</CardTitle>
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
                                htmlFor="start_date"
                                className="block text-sm font-medium mb-1.5"
                            >
                                Başlangıç Tarihi
                            </label>
                            <input
                                id="start_date"
                                type="date"
                                {...register("start_date")}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            {errors.start_date && (
                                <p className="text-xs text-red-600 mt-1">
                                    {errors.start_date.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="end_date"
                                className="block text-sm font-medium mb-1.5"
                            >
                                Bitiş Tarihi (Opsiyonel)
                            </label>
                            <input
                                id="end_date"
                                type="date"
                                {...register("end_date")}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            {errors.end_date && (
                                <p className="text-xs text-red-600 mt-1">
                                    {errors.end_date.message}
                                </p>
                            )}
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

                    <div>
                        <label
                            htmlFor="credit_card_id"
                            className="block text-sm font-medium mb-1.5"
                        >
                            Kredi Kartı (Opsiyonel)
                        </label>
                        <select
                            id="credit_card_id"
                            {...register("credit_card_id")}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">Kart seçilmedi</option>
                            {creditCards.map((card) => (
                                <option key={card.id} value={card.id}>
                                    {card.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="active"
                            {...register("active")}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="active" className="text-sm font-medium">
                            Aktif Abonelik
                        </label>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button type="submit" disabled={isSubmitting} className="flex-1">
                            {isSubmitting ? "Güncelleniyor..." : "Kaydet"}
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

