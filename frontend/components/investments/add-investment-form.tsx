"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateInvestmentRequest, InvestmentType } from "@/lib/types/investments";
import {
    INVESTMENT_TYPE_LABELS,
    INVESTMENT_TYPE_ICONS,
    INVESTMENT_TYPE_COLORS,
    POPULAR_SYMBOLS,
} from "@/lib/types/investments";
import { createInvestment } from "@/lib/api/investments";

interface AddInvestmentFormProps {
    userId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const INVESTMENT_TYPES: InvestmentType[] = ['metal', 'stock_us', 'stock_bist', 'fund', 'bes'];

export function AddInvestmentForm({ userId, onSuccess, onCancel }: AddInvestmentFormProps) {
    const [selectedType, setSelectedType] = useState<InvestmentType | null>(null);
    const [selectedSymbol, setSelectedSymbol] = useState<{ symbol: string; name: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<{
        quantity: number;
        purchasePrice: number;
        purchaseCurrency: string;
        purchaseDate: string;
        notes: string;
    }>({
        defaultValues: {
            purchaseCurrency: "TRY",
            purchaseDate: new Date().toISOString().split("T")[0],
        },
    });

    const onSubmit = async (data: any) => {
        if (!selectedType || !selectedSymbol) {
            setError("Lütfen yatırım türü ve sembol seçin");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const request: CreateInvestmentRequest = {
                user_id: userId,
                type: selectedType,
                symbol: selectedSymbol.symbol,
                name: selectedSymbol.name,
                quantity: parseFloat(data.quantity),
                purchase_price: parseFloat(data.purchasePrice),
                purchase_currency: data.purchaseCurrency,
                purchase_date: new Date(data.purchaseDate).toISOString(),
                notes: data.notes || undefined,
            };

            await createInvestment(request);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Yatırım eklenirken hata oluştu");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (selectedSymbol) {
            setSelectedSymbol(null);
        } else if (selectedType) {
            setSelectedType(null);
        } else {
            onCancel();
        }
    };

    return (
        <Card className="border-2 border-brand/30 bg-gradient-to-br from-background to-brand/5">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Plus className="h-5 w-5 text-brand" />
                    Yatırım Ekle
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onCancel}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                {/* Step 1: Select Type */}
                {!selectedType && (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Yatırım türünü seçin:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {INVESTMENT_TYPES.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={cn(
                                        "p-4 rounded-xl border-2 transition-all duration-200",
                                        "hover:border-brand/50 hover:bg-brand/5 hover:scale-105",
                                        "flex flex-col items-center gap-2 text-center"
                                    )}
                                    style={{ borderColor: `${INVESTMENT_TYPE_COLORS[type]}30` }}
                                >
                                    <span className="text-2xl">{INVESTMENT_TYPE_ICONS[type]}</span>
                                    <span className="text-sm font-medium">{INVESTMENT_TYPE_LABELS[type]}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Select Symbol */}
                {selectedType && !selectedSymbol && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Button variant="ghost" size="sm" onClick={handleBack}>
                                ← Geri
                            </Button>
                            <Badge style={{ backgroundColor: INVESTMENT_TYPE_COLORS[selectedType] }}>
                                {INVESTMENT_TYPE_ICONS[selectedType]} {INVESTMENT_TYPE_LABELS[selectedType]}
                            </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">Sembol seçin veya yazın:</p>

                        {/* Popular symbols */}
                        <div className="flex flex-wrap gap-2">
                            {POPULAR_SYMBOLS[selectedType].map((item) => (
                                <button
                                    key={item.symbol}
                                    onClick={() => setSelectedSymbol(item)}
                                    className={cn(
                                        "px-3 py-2 rounded-lg border-2 border-border transition-all duration-200",
                                        "hover:border-brand/50 hover:bg-brand/5",
                                        "flex items-center gap-2"
                                    )}
                                >
                                    <span className="font-mono font-bold text-sm">{item.symbol}</span>
                                    <span className="text-xs text-muted-foreground hidden sm:inline">{item.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Custom symbol input */}
                        <div className="pt-4 border-t border-border">
                            <p className="text-xs text-muted-foreground mb-2">Veya özel sembol girin:</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Sembol (örn: AAPL)"
                                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                                    id="customSymbol"
                                />
                                <input
                                    type="text"
                                    placeholder="İsim"
                                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                                    id="customName"
                                />
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        const symbolInput = document.getElementById("customSymbol") as HTMLInputElement;
                                        const nameInput = document.getElementById("customName") as HTMLInputElement;
                                        if (symbolInput.value && nameInput.value) {
                                            setSelectedSymbol({
                                                symbol: symbolInput.value.toUpperCase(),
                                                name: nameInput.value,
                                            });
                                        }
                                    }}
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Enter Details */}
                {selectedType && selectedSymbol && (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Button type="button" variant="ghost" size="sm" onClick={handleBack}>
                                ← Geri
                            </Button>
                            <Badge style={{ backgroundColor: INVESTMENT_TYPE_COLORS[selectedType] }}>
                                {INVESTMENT_TYPE_ICONS[selectedType]} {selectedSymbol.symbol}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{selectedSymbol.name}</span>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Miktar <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    {...register("quantity", { required: true, min: 0.00000001 })}
                                    className={cn(
                                        "w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/50",
                                        errors.quantity ? "border-red-500" : "border-border"
                                    )}
                                    placeholder="1.5"
                                />
                            </div>

                            {/* Purchase Price */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Alış Fiyatı <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    {...register("purchasePrice", { required: true, min: 0.01 })}
                                    className={cn(
                                        "w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/50",
                                        errors.purchasePrice ? "border-red-500" : "border-border"
                                    )}
                                    placeholder="100.00"
                                />
                            </div>

                            {/* Currency */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Para Birimi</label>
                                <select
                                    {...register("purchaseCurrency")}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                                >
                                    <option value="TRY">TRY - Türk Lirası</option>
                                    <option value="USD">USD - Amerikan Doları</option>
                                    <option value="EUR">EUR - Euro</option>
                                </select>
                            </div>

                            {/* Purchase Date */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Alış Tarihi</label>
                                <input
                                    type="date"
                                    {...register("purchaseDate")}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Notlar (opsiyonel)</label>
                            <textarea
                                {...register("notes")}
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
                                placeholder="Ek notlar..."
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Ekleniyor..." : "Yatırım Ekle"}
                            </Button>
                            <Button type="button" variant="outline" onClick={onCancel}>
                                İptal
                            </Button>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
