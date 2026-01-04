"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Investment } from "@/lib/types/investments";
import { updateInvestment, UpdateInvestmentRequest } from "@/lib/api/investments";

interface EditInvestmentFormProps {
    investment: Investment;
    onSuccess: () => void;
    onCancel: () => void;
}

export function EditInvestmentForm({ investment, onSuccess, onCancel }: EditInvestmentFormProps) {
    const [quantity, setQuantity] = useState(investment.quantity.toString());
    const [purchasePrice, setPurchasePrice] = useState(investment.purchase_price.toString());
    const [purchaseCurrency, setPurchaseCurrency] = useState(investment.purchase_currency);
    const [purchaseDate, setPurchaseDate] = useState(
        investment.purchase_date ? new Date(investment.purchase_date).toISOString().split("T")[0] : ""
    );
    const [notes, setNotes] = useState(investment.notes || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const updateData: UpdateInvestmentRequest = {};

            // Only include changed fields
            if (parseFloat(quantity) !== investment.quantity) {
                updateData.quantity = parseFloat(quantity);
            }
            if (parseFloat(purchasePrice) !== investment.purchase_price) {
                updateData.purchase_price = parseFloat(purchasePrice);
            }
            if (purchaseCurrency !== investment.purchase_currency) {
                updateData.purchase_currency = purchaseCurrency;
            }
            if (purchaseDate) {
                const newDate = new Date(purchaseDate).toISOString();
                if (newDate !== investment.purchase_date) {
                    updateData.purchase_date = newDate;
                }
            }
            if (notes !== (investment.notes || "")) {
                updateData.notes = notes;
            }

            // Only call API if there are changes
            if (Object.keys(updateData).length > 0) {
                await updateInvestment(investment.id, updateData);
            }

            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Güncelleme başarısız oldu");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="border-2 border-brand/30 bg-gradient-to-br from-background to-brand/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">
                    {investment.symbol} - Düzenle
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onCancel}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Miktar</label>
                            <input
                                type="number"
                                step="any"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                                required
                                min="0.00000001"
                            />
                        </div>

                        {/* Purchase Price */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Alış Fiyatı</label>
                            <input
                                type="number"
                                step="any"
                                value={purchasePrice}
                                onChange={(e) => setPurchasePrice(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                                required
                                min="0.01"
                            />
                        </div>

                        {/* Currency */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Para Birimi</label>
                            <select
                                value={purchaseCurrency}
                                onChange={(e) => setPurchaseCurrency(e.target.value)}
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
                                value={purchaseDate}
                                onChange={(e) => setPurchaseDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Notlar</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
                            placeholder="Ek notlar..."
                        />
                    </div>

                    {/* Error */}
                    {error && <p className="text-sm text-red-500">{error}</p>}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <Button type="submit" disabled={isSubmitting}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                        <Button type="button" variant="outline" onClick={onCancel}>
                            İptal
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
