"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserGuard } from "@/components/user/user-guard";
import { useUser } from "@/contexts/user-context";
import {
    Plus,
    Wallet,
    TrendingUp,
    Calendar,
    RefreshCw,
    Trash2,
    Pencil,
    X,
    Banknote,
    Briefcase,
    Home,
    PiggyBank,
    Gift,
    ShoppingBag,
} from "lucide-react";
import {
    getIncomes,
    getIncomeSummary,
    createIncome,
    deleteIncome,
} from "@/lib/api";
import type {
    Income,
    IncomeSummary,
    CreateIncomeRequest,
} from "@/lib/types";
import { INCOME_CATEGORIES } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils/format";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    "Maaş": Briefcase,
    "Freelance": Banknote,
    "Kira Geliri": Home,
    "Yatırım Getirisi": PiggyBank,
    "Satış Geliri": ShoppingBag,
    "Hediye/Transfer": Gift,
    "Diğer": Wallet,
};

const CATEGORY_COLORS: Record<string, string> = {
    "Maaş": "from-emerald-500 to-green-400",
    "Freelance": "from-blue-500 to-cyan-400",
    "Kira Geliri": "from-amber-500 to-yellow-400",
    "Yatırım Getirisi": "from-purple-500 to-indigo-400",
    "Satış Geliri": "from-pink-500 to-rose-400",
    "Hediye/Transfer": "from-orange-500 to-red-400",
    "Diğer": "from-gray-500 to-slate-400",
};

function IncomeSummaryCards({ summary }: { summary: IncomeSummary | null }) {
    if (!summary) return null;

    return (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-green-500/10">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/20">
                            <Wallet className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">
                                Toplam Gelir
                            </p>
                            <p className="text-lg sm:text-2xl font-bold text-emerald-500">
                                {formatCurrency(summary.total_income, "TRY")}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/20">
                            <Calendar className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">
                                Bu Ay Gelir
                            </p>
                            <p className="text-lg sm:text-2xl font-bold text-blue-500">
                                {formatCurrency(summary.this_month_income, "TRY")}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-500/20">
                            <RefreshCw className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">
                                Aylık Düzenli
                            </p>
                            <p className="text-lg sm:text-2xl font-bold text-purple-500">
                                {formatCurrency(summary.monthly_recurring, "TRY")}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-yellow-500/10">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/20">
                            <TrendingUp className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">
                                En Çok Gelir
                            </p>
                            <p className="text-lg sm:text-xl font-bold text-amber-500 truncate">
                                {summary.top_category || "—"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function IncomeItem({
    income,
    onDelete,
}: {
    income: Income;
    onDelete: (id: string) => void;
}) {
    const IconComponent = CATEGORY_ICONS[income.category] || Wallet;
    const colorClass = CATEGORY_COLORS[income.category] || CATEGORY_COLORS["Diğer"];

    return (
        <div className="p-4 sm:p-5 rounded-xl border-2 border-border/50 hover:border-emerald-500/30 hover:bg-gradient-to-r hover:from-emerald-500/5 hover:to-green-500/5 transition-all duration-300 group">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} text-white shadow-lg`}>
                    <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm sm:text-base truncate group-hover:text-emerald-600 transition-colors">
                            {income.title}
                        </h3>
                        {income.is_recurring && (
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Düzenli
                            </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                            {income.category}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(income.income_date)}
                        </span>
                        {income.notes && (
                            <span className="truncate max-w-[150px]">{income.notes}</span>
                        )}
                    </div>
                </div>
                <div className="text-right flex items-center gap-3">
                    <p className="text-lg sm:text-xl font-bold text-emerald-600">
                        +{formatCurrency(income.amount, income.currency)}
                    </p>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-500"
                        onClick={() => onDelete(income.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function AddIncomeModal({
    userId,
    onClose,
    onSuccess,
}: {
    userId: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState<number | "">("");
    const [category, setCategory] = useState<string>("Maaş");
    const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split("T")[0]);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringPeriod, setRecurringPeriod] = useState<string>("monthly");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !amount || !incomeDate) return;

        setIsSubmitting(true);
        try {
            await createIncome({
                user_id: userId,
                title,
                amount: Number(amount),
                currency: "TRY",
                category,
                is_recurring: isRecurring,
                recurring_period: isRecurring ? recurringPeriod : undefined,
                income_date: incomeDate,
                notes: notes || undefined,
            });
            onSuccess();
        } catch (err) {
            alert("Gelir eklenirken hata oluştu");
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
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                        Gelir Ekle
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
                                placeholder="Örn: Ocak Maaşı, Freelance Proje"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Tutar *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="50000"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Tarih *
                                </label>
                                <input
                                    type="date"
                                    value={incomeDate}
                                    onChange={(e) => setIncomeDate(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                Kategori
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                {INCOME_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <input
                                type="checkbox"
                                id="isRecurring"
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                                className="h-4 w-4 rounded border-border"
                            />
                            <label htmlFor="isRecurring" className="text-sm font-medium flex-1">
                                Düzenli gelir (aylık maaş gibi)
                            </label>
                            {isRecurring && (
                                <select
                                    value={recurringPeriod}
                                    onChange={(e) => setRecurringPeriod(e.target.value)}
                                    className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
                                >
                                    <option value="monthly">Aylık</option>
                                    <option value="yearly">Yıllık</option>
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                Not (Opsiyonel)
                            </label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Ek bilgi..."
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
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

function IncomesContent() {
    const { user } = useUser();
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [summary, setSummary] = useState<IncomeSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState<"all" | "recurring" | "onetime">("all");

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    async function fetchData() {
        if (!user) return;
        setLoading(true);
        try {
            const [incomesData, summaryData] = await Promise.all([
                getIncomes(user.id),
                getIncomeSummary(user.id),
            ]);
            setIncomes(Array.isArray(incomesData) ? incomesData : []);
            setSummary(summaryData);
        } catch (err) {
            console.error("Error fetching incomes:", err);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu geliri silmek istediğinize emin misiniz?")) return;
        try {
            await deleteIncome(id);
            fetchData();
        } catch (err) {
            alert("Silme işlemi başarısız oldu");
        }
    };

    const handleIncomeCreated = () => {
        setShowModal(false);
        fetchData();
    };

    const filteredIncomes = incomes.filter((income) => {
        if (filter === "recurring") return income.is_recurring;
        if (filter === "onetime") return !income.is_recurring;
        return true;
    });

    // Group by category
    const groupedByCategory = filteredIncomes.reduce((acc, income) => {
        if (!acc[income.category]) {
            acc[income.category] = [];
        }
        acc[income.category].push(income);
        return acc;
    }, {} as Record<string, Income[]>);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Modal */}
            {showModal && user && (
                <AddIncomeModal
                    userId={user.id}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleIncomeCreated}
                />
            )}

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl bg-gradient-to-r from-emerald-500 to-green-400 bg-clip-text text-transparent">
                        Gelirler
                    </h1>
                    <p className="text-muted-foreground mt-1.5">
                        Maaş, freelance ve diğer gelirlerinizi takip edin
                    </p>
                </div>
                <Button onClick={() => setShowModal(true)} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Gelir Ekle
                </Button>
            </div>

            {/* Summary Cards */}
            <IncomeSummaryCards summary={summary} />

            {/* Filter */}
            <Card>
                <CardContent className="pt-4 pb-4">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={filter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter("all")}
                        >
                            Tümü ({incomes.length})
                        </Button>
                        <Button
                            variant={filter === "recurring" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter("recurring")}
                        >
                            <RefreshCw className="h-3.5 w-3.5 mr-1" />
                            Düzenli
                        </Button>
                        <Button
                            variant={filter === "onetime" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter("onetime")}
                        >
                            Tek Seferlik
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Income List */}
            {filteredIncomes.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Wallet className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground mb-4">
                            {filter === "all"
                                ? "Henüz gelir eklenmemiş"
                                : filter === "recurring"
                                    ? "Düzenli gelir bulunmuyor"
                                    : "Tek seferlik gelir bulunmuyor"}
                        </p>
                        <Button variant="outline" onClick={() => setShowModal(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            İlk Gelirinizi Ekleyin
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedByCategory).map(([category, categoryIncomes]) => {
                        const categoryTotal = categoryIncomes.reduce((sum, inc) => sum + inc.amount, 0);
                        const IconComponent = CATEGORY_ICONS[category] || Wallet;

                        return (
                            <Card key={category} className="border-2 hover:border-emerald-500/30 transition-colors">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <IconComponent className="h-5 w-5 text-emerald-500" />
                                            {category}
                                            <Badge variant="secondary">
                                                {categoryIncomes.length} gelir
                                            </Badge>
                                        </CardTitle>
                                        <p className="text-lg font-bold text-emerald-600">
                                            +{formatCurrency(categoryTotal, "TRY")}
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {categoryIncomes
                                        .sort((a, b) => new Date(b.income_date).getTime() - new Date(a.income_date).getTime())
                                        .map((income) => (
                                            <IncomeItem
                                                key={income.id}
                                                income={income}
                                                onDelete={handleDelete}
                                            />
                                        ))}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function IncomesPage() {
    return (
        <UserGuard>
            <IncomesContent />
        </UserGuard>
    );
}
