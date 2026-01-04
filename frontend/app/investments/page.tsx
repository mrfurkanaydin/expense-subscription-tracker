"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { UserGuard } from "@/components/user/user-guard";
import { PortfolioOverview } from "@/components/investments/portfolio-overview";
import { InvestmentCard } from "@/components/investments/investment-card";
import { AddInvestmentForm } from "@/components/investments/add-investment-form";
import { EditInvestmentForm } from "@/components/investments/edit-investment-form";
import { useUser } from "@/contexts/user-context";
import { getInvestments, deleteInvestment } from "@/lib/api/investments";
import { getMarketPricesAsync, clearPriceCache } from "@/lib/api/market-data";
import {
    Plus,
    TrendingUp,
    Gem,
    BarChart3,
    Landmark,
    PiggyBank,
    RefreshCw,
} from "lucide-react";
import type { Investment, InvestmentType, MarketPrice } from "@/lib/types/investments";
import {
    INVESTMENT_TYPE_LABELS,
    INVESTMENT_TYPE_ICONS,
    INVESTMENT_TYPE_COLORS,
} from "@/lib/types/investments";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<InvestmentType, React.ReactNode> = {
    metal: <Gem className="h-4 w-4" />,
    stock_us: <TrendingUp className="h-4 w-4" />,
    stock_bist: <BarChart3 className="h-4 w-4" />,
    fund: <Landmark className="h-4 w-4" />,
    bes: <PiggyBank className="h-4 w-4" />,
};

function InvestmentsContent() {
    const { user } = useUser();
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [marketPrices, setMarketPrices] = useState<Map<string, MarketPrice>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
    const [selectedType, setSelectedType] = useState<InvestmentType | "all">("all");
    const [isRefreshing, setIsRefreshing] = useState(false);

    // ... fetchData and useEffect remain the same ...

    const fetchData = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await getInvestments(user.id);
            setInvestments(Array.isArray(data) ? data : []);

            // Fetch market prices for all symbols (async - real API)
            if (data.length > 0) {
                const symbols = data.map((inv: Investment) => inv.symbol);
                const uniqueSymbols = [...new Set(symbols)];
                const prices = await getMarketPricesAsync(uniqueSymbols);
                setMarketPrices(prices);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        clearPriceCache(); // Clear cached prices to fetch fresh data
        await fetchData();
        setIsRefreshing(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu yatırımı silmek istediğinize emin misiniz?")) return;

        try {
            await deleteInvestment(id);
            setInvestments((prev) => prev.filter((inv) => inv.id !== id));
        } catch (err) {
            alert("Silme işlemi başarısız oldu");
        }
    };

    const handleInvestmentCreated = () => {
        setShowForm(false);
        fetchData();
    };

    const handleEdit = (investment: Investment) => {
        setEditingInvestment(investment);
    };

    const handleUpdateSuccess = () => {
        setEditingInvestment(null);
        fetchData();
    };

    // Filter investments by type
    const filteredInvestments = useMemo(() => {
        if (selectedType === "all") return investments;
        return investments.filter((inv) => inv.type === selectedType);
    }, [investments, selectedType]);

    // Group by type for stats
    const investmentsByType = useMemo(() => {
        const grouped = new Map<InvestmentType, Investment[]>();
        for (const inv of investments) {
            const type = inv.type as InvestmentType;
            const existing = grouped.get(type) || [];
            grouped.set(type, [...existing, inv]);
        }
        return grouped;
    }, [investments]);

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
            {/* Edit Modal Overlay */}
            {editingInvestment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg relative z-50">
                        <EditInvestmentForm
                            investment={editingInvestment}
                            onSuccess={handleUpdateSuccess}
                            onCancel={() => setEditingInvestment(null)}
                        />
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                        Yatırımlar
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Portföyünüzü takip edin ve anlık değerleri görün
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                        Yenile
                    </Button>
                    <Button onClick={() => setShowForm(!showForm)}>
                        <Plus className="h-4 w-4 mr-2" />
                        {showForm ? "Formu Kapat" : "Yatırım Ekle"}
                    </Button>
                </div>
            </div>

            {/* Add Investment Form */}
            {showForm && user && (
                <AddInvestmentForm
                    userId={user.id}
                    onSuccess={handleInvestmentCreated}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {/* Portfolio Overview */}
            <PortfolioOverview investments={investments} />

            {/* Type Filter */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant={selectedType === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedType("all")}
                        >
                            Tümü
                            <Badge variant="secondary" className="ml-2">
                                {investments.length}
                            </Badge>
                        </Button>
                        {(["metal", "stock_us", "stock_bist", "fund", "bes"] as InvestmentType[]).map((type) => {
                            const count = investmentsByType.get(type)?.length || 0;
                            if (count === 0) return null;
                            return (
                                <Button
                                    key={type}
                                    variant={selectedType === type ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedType(type)}
                                    style={{
                                        borderColor: selectedType === type ? undefined : `${INVESTMENT_TYPE_COLORS[type]}50`,
                                    }}
                                >
                                    {TYPE_ICONS[type]}
                                    <span className="ml-1.5">{INVESTMENT_TYPE_LABELS[type]}</span>
                                    <Badge variant="secondary" className="ml-2">
                                        {count}
                                    </Badge>
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Investment List */}
            {filteredInvestments.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <p className="text-muted-foreground mb-4">
                            {selectedType === "all"
                                ? "Henüz yatırım eklenmemiş"
                                : "Bu kategoride yatırım bulunamadı"}
                        </p>
                        {!showForm && (
                            <Button onClick={() => setShowForm(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                İlk Yatırımı Ekle
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredInvestments.map((investment, index) => (
                        <InvestmentCard
                            key={investment.id}
                            investment={investment}
                            marketPrice={marketPrices.get(investment.symbol)}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            index={index}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function InvestmentsPage() {
    return (
        <UserGuard>
            <InvestmentsContent />
        </UserGuard>
    );
}
