"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EXPENSE_CATEGORIES, CURRENCIES } from "@/lib/constants";
import { updateExpense } from "@/lib/api";
import type { Expense, UpdateExpenseRequest } from "@/lib/types";

const expenseSchema = z.object({
    title: z.string().min(1, "Başlık gereklidir"),
    amount: z.number().positive("Tutar pozitif olmalıdır"),
    currency: z.enum(["TRY", "USD", "EUR", "GBP"]),
    category: z.string().min(1, "Kategori seçilmelidir"),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface EditExpenseFormProps {
    expense: Expense;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function EditExpenseForm({
    expense,
    onSuccess,
    onCancel,
}: EditExpenseFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            title: expense.title,
            amount: expense.amount,
            currency: expense.currency as any,
            category: expense.category,
        },
    });

    const onSubmit = async (data: ExpenseFormData) => {
        try {
            setIsSubmitting(true);
            const request: UpdateExpenseRequest = {
                id: expense.id,
                ...data,
            };
            await updateExpense(request);
            onSuccess?.();
        } catch (error) {
            console.error("Error updating expense:", error);
            alert("Gider güncellenirken bir hata oluştu");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gideri Düzenle</CardTitle>
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
