"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserGuard } from "@/components/user/user-guard";
import { useUser } from "@/contexts/user-context";
import {
    Plus,
    CreditCard as CreditCardIcon,
    Wallet,
    Calendar,
    TrendingDown,
    CheckCircle2,
    Clock,
    Trash2,
    ChevronDown,
    ChevronUp,
    X,
    Pencil,
} from "lucide-react";
import {
    getCreditCards,
    getDebts,
    getDebtSummary,
    createCreditCard,
    createDebt,
    deleteCreditCard,
    deleteDebt,
    payInstallment,
    updateDebt,
    getSubscriptions,
} from "@/lib/api";
import type {
    CreditCard,
    Debt,
    DebtSummary,
    CreateCreditCardRequest,
    CreateDebtRequest,
    Subscription,
} from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils/format";

const CARD_COLORS = [
    { name: "Mor", value: "#8B5CF6" },
    { name: "Mavi", value: "#3B82F6" },
    { name: "Yeşil", value: "#10B981" },
    { name: "Turuncu", value: "#F59E0B" },
    { name: "Kırmızı", value: "#EF4444" },
    { name: "Pembe", value: "#EC4899" },
    { name: "Cyan", value: "#06B6D4" },
    { name: "Indigo", value: "#6366F1" },
];

function DebtSummaryCards({ summary }: { summary: DebtSummary | null }) {
    if (!summary) return null;

    const progress =
        summary.total_installments > 0
            ? Math.round(
                (summary.paid_installments / summary.total_installments) * 100
            )
            : 0;

    return (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 border-red-500/20 bg-gradient-to-br from-red-500/10 to-orange-500/10">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-red-500/20">
                            <Wallet className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">
                                Toplam Borç
                            </p>
                            <p className="text-lg sm:text-2xl font-bold text-red-500">
                                {formatCurrency(summary.total_debt, "TRY")}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-yellow-500/10">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/20">
                            <Calendar className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">
                                Aylık Ödeme
                            </p>
                            <p className="text-lg sm:text-2xl font-bold text-amber-500">
                                {formatCurrency(summary.total_monthly_payment, "TRY")}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/20">
                            <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">
                                Aktif Borç
                            </p>
                            <p className="text-lg sm:text-2xl font-bold text-blue-500">
                                {summary.active_debts_count}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-green-500/10">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/20">
                            <TrendingDown className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">
                                İlerleme
                            </p>
                            <p className="text-lg sm:text-2xl font-bold text-emerald-500">
                                %{progress}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function CreditCardDisplay({
    card,
    totalDebt,
    monthlyPayment,
    onDelete,
    // children prop removed as per user request to relocate subscriptions
}: {
    card: CreditCard;
    totalDebt?: number;
    monthlyPayment?: number;
    onDelete: (id: string) => void;
}) {
    return (
        <div
            className="relative w-full max-w-[280px] h-[165px] rounded-2xl p-5 text-white overflow-hidden shadow-xl hover:scale-105 transition-transform duration-300 cursor-pointer group"
            style={{
                background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 50%, ${card.color}aa 100%)`,
            }}
        >
            {/* Decorative circles */}
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -right-4 -bottom-10 w-24 h-24 rounded-full bg-white/10" />

            {/* Delete button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(card.id);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
            >
                <Trash2 className="h-4 w-4" />
            </button>

            {/* Card content */}
            <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs text-white/70 font-medium">
                            {card.bank_name || "Kredi Kartı"}
                        </p>
                        <p className="text-lg font-bold tracking-wide">{card.name}</p>
                    </div>
                    <CreditCardIcon className="h-8 w-8 text-white/80" />
                </div>

                <div>
                    <p className="text-lg font-mono tracking-widest">
                        •••• •••• •••• {card.last_four_digits || "••••"}
                    </p>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] text-white/60 uppercase">Toplam Borç</p>
                        <p className="text-sm font-bold">
                            {formatCurrency(totalDebt || card.total_debt || 0, card.currency)}
                        </p>
                    </div>
                    {card.due_day && (
                        <div className="text-right">
                            <p className="text-[10px] text-white/60 uppercase">Son Ödeme</p>
                            <p className="text-sm font-medium">Her ayın {card.due_day}'i</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Combined type for display
type DebtOrSubscription = Debt & {
    isSubscription?: boolean;
    originalId?: string;
};

function DebtItem({
    debt,
    onPay,
    onDelete,
    onEdit,
}: {
    debt: DebtOrSubscription;
    onPay: (id: string, isSubscription?: boolean) => void;
    onDelete: (id: string, isSubscription?: boolean) => void;
    onEdit: (debt: DebtOrSubscription) => void;
}) {
    const progress =
        debt.installment_count > 0
            ? Math.round((debt.paid_installments / debt.installment_count) * 100)
            : 0;
    const isPaid = debt.status === "paid";

    return (
        <div
            className={`p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 ${isPaid
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-border/50 hover:border-brand/30 hover:bg-gradient-to-r hover:from-brand/5 hover:to-accent/5"
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm sm:text-base truncate">
                            {debt.title}
                        </h3>
                        {isPaid && (
                            <Badge
                                variant="outline"
                                className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Tamamlandı
                            </Badge>
                        )}
                        {debt.isSubscription && (
                            <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/30">
                                <CreditCardIcon className="h-3 w-3 mr-1" />
                                Abonelik
                            </Badge>
                        )}
                        {debt.credit_card_name && (
                            <Badge variant="secondary" className="text-xs">
                                {debt.credit_card_name}
                            </Badge>
                        )}
                    </div>
                    {debt.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {debt.description}
                        </p>
                    )}
                </div>
                <div className="text-right shrink-0">
                    <p className="text-sm sm:text-base font-bold">
                        {formatCurrency(debt.remaining_amount, debt.currency)}
                    </p>
                    {debt.isSubscription ? (
                        <p className="text-xs text-muted-foreground">/ ay</p>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            / {formatCurrency(debt.total_amount, debt.currency)}
                        </p>
                    )}
                </div>
            </div>

            {/* Progress bar - Hidden for subscriptions */}
            {!debt.isSubscription && (
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">
                            {debt.paid_installments} / {debt.installment_count} taksit
                        </span>
                        <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isPaid
                                ? "bg-emerald-500"
                                : "bg-gradient-to-r from-brand to-accent"
                                }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Bottom info */}
            <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {isPaid
                            ? "Tamamlandı"
                            : debt.isSubscription
                                ? `Sonraki: ${formatDate(debt.next_payment_date)}`
                                : `Sonraki: ${formatDate(debt.next_payment_date)}`}
                    </span>
                    {debt.installment_amount && !isPaid && (
                        <span className="font-medium text-foreground">
                            {formatCurrency(debt.installment_amount, debt.currency)} / ay
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    {!isPaid && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30"
                            onClick={() => onPay(debt.id, debt.isSubscription)}
                        >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            {debt.isSubscription ? "Ödendi" : "Taksit Öde"}
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-muted"
                        disabled={debt.isSubscription} // Disable edit for subscriptions in this view
                        onClick={() => onEdit(debt)}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500"
                        onClick={() => onDelete(debt.id, debt.isSubscription)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function AddCreditCardModal({
    userId,
    onClose,
    onSuccess,
}: {
    userId: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [name, setName] = useState("");
    const [bankName, setBankName] = useState("");
    const [lastFour, setLastFour] = useState("");
    const [dueDay, setDueDay] = useState<number | "">("");
    const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0].value);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        setIsSubmitting(true);
        try {
            await createCreditCard({
                user_id: userId,
                name,
                bank_name: bankName || undefined,
                last_four_digits: lastFour || undefined,
                due_day: dueDay ? Number(dueDay) : undefined,
                currency: "TRY",
                color: selectedColor,
            });
            onSuccess();
        } catch (err) {
            alert("Kart eklenirken hata oluştu");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted"
                >
                    <X className="h-5 w-5" />
                </button>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCardIcon className="h-5 w-5 text-brand" />
                        Kredi Kartı Ekle
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                Kart Adı *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Örn: Yapıkredi, QNB"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                Banka Adı
                            </label>
                            <input
                                type="text"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Örn: Yapı Kredi Bankası"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Son 4 Hane
                                </label>
                                <input
                                    type="text"
                                    maxLength={4}
                                    value={lastFour}
                                    onChange={(e) => setLastFour(e.target.value.replace(/\D/g, ""))}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="1234"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Son Ödeme Günü
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={31}
                                    value={dueDay}
                                    onChange={(e) =>
                                        setDueDay(e.target.value ? Number(e.target.value) : "")
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="15"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Kart Rengi
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {CARD_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setSelectedColor(color.value)}
                                        className={`w-8 h-8 rounded-lg transition-all ${selectedColor === color.value
                                            ? "ring-2 ring-offset-2 ring-brand scale-110"
                                            : "hover:scale-105"
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={isSubmitting} className="flex-1">
                                {isSubmitting ? "Ekleniyor..." : "Kaydet"}
                            </Button>
                            <Button type="button" variant="outline" onClick={onClose}>
                                İptal
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function AddDebtModal({
    userId,
    cards,
    onClose,
    onSuccess,
}: {
    userId: string;
    cards: CreditCard[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [totalAmount, setTotalAmount] = useState<number | "">("");
    const [installmentCount, setInstallmentCount] = useState<number | "">(1);
    const [firstPaymentDate, setFirstPaymentDate] = useState("");
    const [creditCardId, setCreditCardId] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !totalAmount || !firstPaymentDate) return;

        setIsSubmitting(true);
        try {
            await createDebt({
                user_id: userId,
                credit_card_id: creditCardId || undefined,
                title,
                description: description || undefined,
                total_amount: Number(totalAmount),
                currency: "TRY",
                installment_count: Number(installmentCount) || 1,
                installment_type: "fixed",
                first_payment_date: firstPaymentDate,
            });
            onSuccess();
        } catch (err) {
            alert("Borç eklenirken hata oluştu");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted"
                >
                    <X className="h-5 w-5" />
                </button>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-brand" />
                        Borç / Taksit Ekle
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                Başlık *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Örn: iPhone 15 Pro, Buzdolabı"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                Açıklama
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Opsiyonel açıklama"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Toplam Tutar *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={totalAmount}
                                    onChange={(e) =>
                                        setTotalAmount(e.target.value ? Number(e.target.value) : "")
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="50000"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Taksit Sayısı
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={60}
                                    value={installmentCount}
                                    onChange={(e) =>
                                        setInstallmentCount(
                                            e.target.value ? Number(e.target.value) : ""
                                        )
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="12"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                İlk Ödeme Tarihi *
                            </label>
                            <input
                                type="date"
                                value={firstPaymentDate}
                                onChange={(e) => setFirstPaymentDate(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                required
                            />
                        </div>
                        {cards.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Kredi Kartı (Opsiyonel)
                                </label>
                                <select
                                    value={creditCardId}
                                    onChange={(e) => setCreditCardId(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">Seçiniz</option>
                                    {cards.map((card) => (
                                        <option key={card.id} value={card.id}>
                                            {card.name} ({card.last_four_digits})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {totalAmount && installmentCount && (
                            <div className="p-3 rounded-lg bg-brand/10 border border-brand/20">
                                <p className="text-sm text-muted-foreground">
                                    Aylık taksit tutarı:
                                </p>
                                <p className="text-lg font-bold text-brand">
                                    {formatCurrency(
                                        Number(totalAmount) / Number(installmentCount),
                                        "TRY"
                                    )}
                                </p>
                            </div>
                        )}
                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={isSubmitting} className="flex-1">
                                {isSubmitting ? "Ekleniyor..." : "Ekle"}
                            </Button>
                            <Button type="button" variant="outline" onClick={onClose}>
                                İptal
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function EditDebtModal({
    debt,
    cards,
    onClose,
    onSuccess,
}: {
    debt: Debt;
    cards: CreditCard[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [title, setTitle] = useState(debt.title);
    const [description, setDescription] = useState(debt.description || "");
    const [creditCardId, setCreditCardId] = useState<string>(debt.credit_card_id || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        setIsSubmitting(true);
        try {
            await updateDebt({
                id: debt.id,
                title,
                description: description || undefined,
                credit_card_id: creditCardId || undefined,
            });
            onSuccess();
        } catch (err) {
            alert("Borç güncellenirken hata oluştu");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted">
                    <X className="h-5 w-5" />
                </button>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Pencil className="h-5 w-5 text-brand" />
                        Borcu Düzenle
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Başlık *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Örn: iPhone 15 Pro"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Açıklama</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Opsiyonel açıklama"
                            />
                        </div>
                        {cards.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Kredi Kartı</label>
                                <select
                                    value={creditCardId}
                                    onChange={(e) => setCreditCardId(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">Kart Yok</option>
                                    {cards.map((card) => (
                                        <option key={card.id} value={card.id}>
                                            {card.name} ({card.last_four_digits})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={isSubmitting} className="flex-1">
                                {isSubmitting ? "Güncelleniyor..." : "Güncelle"}
                            </Button>
                            <Button type="button" variant="outline" onClick={onClose}>
                                İptal
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function DebtsContent() {
    const { user } = useUser();
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [summary, setSummary] = useState<DebtSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCardModal, setShowCardModal] = useState(false);
    const [showDebtModal, setShowDebtModal] = useState(false);
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
    const [showCards, setShowCards] = useState(true);
    const [filter, setFilter] = useState<"all" | "active" | "paid">("all");

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    async function fetchData() {
        if (!user) return;
        setLoading(true);
        try {
            const [cardsData, debtsData, summaryData, subsData] = await Promise.all([
                getCreditCards(user.id),
                getDebts(user.id),
                getDebtSummary(user.id),
                getSubscriptions(user.id),
            ]);
            setCards(Array.isArray(cardsData) ? cardsData : []);
            setDebts(Array.isArray(debtsData) ? debtsData : []);
            setSummary(summaryData);
            setSubscriptions(Array.isArray(subsData) ? subsData : []);
        } catch (err) {
            console.error("Error fetching debts data:", err);
        } finally {
            setLoading(false);
        }
    }

    const handlePayInstallment = async (id: string, isSubscription?: boolean) => {
        if (isSubscription) {
            // Logic for paying subscription (maybe just mark as paid for this month?)
            // For now, let's treat it as a placeholder action or alert
            alert("Abonelik ödemesi henüz desteklenmiyor");
            return;
        }

        if (!confirm("Bu taksiti ödenmiş olarak işaretlemek istiyor musunuz?"))
            return;
        try {
            await payInstallment(id);
            fetchData();
        } catch (err) {
            alert("İşlem başarısız oldu");
        }
    };

    const handleDeleteCard = async (id: string) => {
        if (
            !confirm(
                "Bu kredi kartını silmek istediğinize emin misiniz? Bağlı borçlar karttan ayrılacaktır."
            )
        )
            return;
        try {
            await deleteCreditCard(id);
            fetchData();
        } catch (err) {
            alert("Silme işlemi başarısız oldu");
        }
    };

    const handleDeleteDebt = async (id: string, isSubscription?: boolean) => {
        if (isSubscription) {
            if (!confirm("Bu aboneliği listeden kaldırmak istediğinize emin misiniz? (Gerçekten silinmez, sadece buradan gizlenir)")) return;
            // Actually we can't delete subscription from here easily without API
            alert("Abonelikleri silmek için Abonelikler sayfasına gidiniz.");
            return;
        }

        if (!confirm("Bu borcu silmek istediğinize emin misiniz?")) return;
        try {
            await deleteDebt(id);
            fetchData();
        } catch (err) {
            alert("Silme işlemi başarısız oldu");
        }
    };

    const handleCardCreated = () => {
        setShowCardModal(false);
        fetchData();
    };

    const handleDebtCreated = () => {
        setShowDebtModal(false);
        fetchData();
    };

    const handleDebtEdited = () => {
        setEditingDebt(null);
        fetchData();
    };

    const filteredDebtsAndSubs: DebtOrSubscription[] = [
        ...debts,
        // Map subscriptions to Debt structure
        ...subscriptions
            .filter(s => s.active && s.credit_card_id)
            .map(s => {
                const card = cards.find(c => c.id === s.credit_card_id);
                return {
                    id: s.id,
                    user_id: s.user_id,
                    title: s.title,
                    description: "Abonelik",
                    total_amount: s.amount, // used as monthly amount
                    remaining_amount: s.amount,
                    currency: s.currency,
                    installment_count: 0,
                    installment_amount: s.amount,
                    paid_installments: 0,
                    status: "active" as const,
                    created_at: s.created_at,
                    first_payment_date: s.next_billing_at, // Mapping next billing to first payment
                    next_payment_date: s.next_billing_at,
                    credit_card_id: s.credit_card_id,
                    credit_card_name: card ? card.name : undefined,
                    installment_type: "fixed" as const,
                    isSubscription: true,
                    originalId: s.id
                } as DebtOrSubscription;
            })
    ].filter((d) => {
        if (filter === "active") return d.status === "active";
        if (filter === "paid") return d.status === "paid";
        return true;
    });

    // Sort by name for now, or maybe date?
    filteredDebtsAndSubs.sort((a, b) => new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime());

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Modals */}
            {showCardModal && user && (
                <AddCreditCardModal
                    userId={user.id}
                    onClose={() => setShowCardModal(false)}
                    onSuccess={handleCardCreated}
                />
            )}
            {showDebtModal && user && (
                <AddDebtModal
                    userId={user.id}
                    cards={cards}
                    onClose={() => setShowDebtModal(false)}
                    onSuccess={handleDebtCreated}
                />
            )}
            {editingDebt && (
                <EditDebtModal
                    debt={editingDebt}
                    cards={cards}
                    onClose={() => setEditingDebt(null)}
                    onSuccess={handleDebtEdited}
                />
            )}

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                        Borçlar & Taksitler
                    </h1>
                    <p className="text-muted-foreground mt-1.5">
                        Kredi kartlarınızı ve taksitli borçlarınızı takip edin
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowCardModal(true)}>
                        <CreditCardIcon className="h-4 w-4 mr-2" />
                        Kart Ekle
                    </Button>
                    <Button onClick={() => setShowDebtModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Borç Ekle
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <TrendingDown className="h-4 w-4" />
                            <span className="text-sm font-medium">Toplam Borç</span>
                        </div>
                        <p className="text-2xl font-bold">
                            {formatCurrency(summary?.total_debt || 0, "TRY")}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-medium">Bu Ay Ödenecek</span>
                        </div>
                        <p className="text-2xl font-bold">
                            {formatCurrency(summary?.total_monthly_payment || 0, "TRY")}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <CreditCardIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">Aktif Borçlar</span>
                        </div>
                        <p className="text-2xl font-bold">{summary?.active_debts_count || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm font-medium">İlerleme</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>
                                    {summary?.paid_installments || 0} /{" "}
                                    {summary?.total_installments || 0} Taksit
                                </span>
                                <span>
                                    %
                                    {summary?.total_installments
                                        ? Math.round(
                                            (summary.paid_installments / summary.total_installments) * 100
                                        )
                                        : 0}
                                </span>
                            </div>
                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                <div
                                    className="h-full bg-brand transition-all duration-500"
                                    style={{
                                        width: `${summary?.total_installments
                                            ? (summary.paid_installments / summary.total_installments) *
                                            100
                                            : 0
                                            }%`,
                                    }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Credit Cards Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CreditCardIcon className="h-5 w-5 text-brand" />
                        Kredi Kartlarım
                    </h3>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCards(!showCards)}
                        >
                            {showCards ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowCardModal(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Kart Ekle
                        </Button>
                    </div>
                </div>

                {showCards && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {cards.map((card) => {
                            const cardDebts = debts.filter(
                                (d) => d.credit_card_id === card.id && d.status === "active"
                            );
                            const cardTotalDebt = cardDebts.reduce(
                                (sum, d) => sum + d.remaining_amount,
                                0
                            );
                            const cardMonthlyPayment = cardDebts.reduce(
                                (sum, d) => sum + (d.installment_amount || 0),
                                0
                            );
                            return (
                                <CreditCardDisplay
                                    key={card.id}
                                    card={card}
                                    totalDebt={cardTotalDebt}
                                    monthlyPayment={cardMonthlyPayment}
                                    onDelete={handleDeleteCard}
                                />
                            );
                        })}
                        {cards.length === 0 && (
                            <div className="col-span-full text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                                Henüz kredi kartı eklenmemiş
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Debts List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-brand" />
                            Borçlar & Taksitler
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant={filter === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter("all")}
                            >
                                Tümü
                            </Button>
                            <Button
                                variant={filter === "active" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter("active")}
                            >
                                Aktif
                            </Button>
                            <Button
                                variant={filter === "paid" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter("paid")}
                            >
                                Tamamlanan
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredDebtsAndSubs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>
                                {filter === "all"
                                    ? "Henüz borç veya abonelik eklenmemiş"
                                    : filter === "active"
                                        ? "Aktif borç bulunmuyor"
                                        : "Tamamlanan borç bulunmuyor"}
                            </p>
                            {filter === "all" && (
                                <Button variant="outline" onClick={() => setShowDebtModal(true)} className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" />
                                    İlk Borcunuzu Ekleyin
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredDebtsAndSubs.map((item) => (
                                <DebtItem
                                    key={item.id}
                                    debt={item}
                                    onPay={handlePayInstallment}
                                    onDelete={handleDeleteDebt}
                                    onEdit={item.isSubscription ? () => { } : setEditingDebt}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function DebtsPage() {
    return (
        <UserGuard>
            <DebtsContent />
        </UserGuard>
    );
}
