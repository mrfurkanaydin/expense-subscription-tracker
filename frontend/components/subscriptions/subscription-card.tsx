import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Subscription } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
    Calendar,
    CreditCard,
    MoreVertical,
    Pencil,
    Trash2,
    Ban,
    Clock,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SubscriptionCardProps {
    subscription: Subscription;
    onEdit: (s: Subscription) => void;
    onDelete: (id: string) => void;
    onCancel: (s: Subscription) => void;
}

export function SubscriptionCard({
    subscription,
    onEdit,
    onDelete,
    onCancel,
}: SubscriptionCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Status check
    const isActive = subscription.active;

    // Date Logic
    const calculateNextPayment = (dateStr: string, period: string) => {
        let date = new Date(dateStr);
        const now = new Date();

        // Only auto-roll date if subscription is active
        if (isActive && date < now) {
            // Loop until we find the next future date
            while (date < now) {
                if (period === "monthly") {
                    date.setMonth(date.getMonth() + 1);
                } else {
                    date.setFullYear(date.getFullYear() + 1);
                }
            }
        }
        return date;
    };

    const nextBillingDate = calculateNextPayment(subscription.next_billing_at, subscription.billing_period);
    const now = new Date();
    const diffTime = nextBillingDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const isToday = diffDays === 0;

    return (
        <Card
            className={cn(
                "group relative overflow-hidden border transition-all duration-300",
                isActive
                    ? "border-white/10 bg-gradient-to-br from-card to-background hover:border-brand/50 hover:shadow-2xl hover:shadow-brand/10"
                    : "opacity-70 grayscale border-white/5 bg-background/50",
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Glow Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none -translate-x-full group-hover:translate-x-full" />

            <CardContent className="p-6">
                {/* Header: Icon + Title + Status */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-inner",
                            isActive ? "from-brand/20 to-brand/5 text-brand" : "from-gray-800 to-gray-900 text-gray-500"
                        )}>
                            <span className="text-xl font-bold">
                                {subscription.title.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight tracking-tight">
                                {subscription.title}
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                {subscription.billing_period === "monthly" ? "Aylık Plan" : "Yıllık Plan"}
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className={cn(
                            "px-2.5 py-0.5 text-xs font-semibold capitalize border-2",
                            isActive
                                ? "border-green-500/50 text-green-500 bg-green-500/10"
                                : "border-gray-600 text-gray-500"
                        )}
                    >
                        {isActive ? "Aktif" : "İptal"}
                    </Badge>
                </div>

                {/* Amount */}
                <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black tracking-tighter text-foreground">
                            {formatCurrency(subscription.amount, subscription.currency)}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">
                            / {subscription.billing_period === "monthly" ? "ay" : "yıl"}
                        </span>
                    </div>
                </div>

                {/* Date Info */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                                {isActive ? "Sonraki Ödeme" : "Bitiş Tarihi"}
                            </span>
                        </div>
                        <div className={cn(
                            "font-bold flex items-center gap-1.5",
                            "text-foreground"
                        )}>
                            {isActive && <Clock className="h-4 w-4" />}
                            <span>{formatDate(isActive ? nextBillingDate.toISOString() : subscription.end_date || subscription.next_billing_at)}</span>
                        </div>
                    </div>

                    {/* Relative Time Text */}
                    <div className="text-right">
                        <p className={cn(
                            "text-xs font-medium",
                            isActive ? "text-brand" : "text-muted-foreground"
                        )}>
                            {isActive ? (
                                isToday
                                    ? "Bugün ödenmeli"
                                    : `${diffDays} gün kaldı`
                            ) : (
                                subscription.end_date
                                    ? `${formatDate(subscription.end_date)} tarihinde bitti`
                                    : "Süresi doldu"
                            )}
                        </p>
                    </div>
                </div>
            </CardContent>

            {/* Footer Actions - Always Visible but Subtle */}
            <CardFooter className="bg-secondary/20 p-2 grid grid-cols-3 gap-1">
                {isActive ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-orange-500 hover:text-orange-600 hover:bg-orange-500/10 h-9"
                        onClick={() => onCancel(subscription)}
                        title="Aboneliği İptal Et"
                    >
                        <Ban className="h-4 w-4 mr-2" />
                        <span className="text-xs font-semibold">İptal</span>
                    </Button>
                ) : (
                    <div className="flex items-center justify-center text-xs text-muted-foreground">
                        Pasif
                    </div>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-foreground hover:bg-white/5 h-9"
                    onClick={() => onEdit(subscription)}
                    title="Düzenle"
                >
                    <Pencil className="h-4 w-4 mr-2" />
                    <span className="text-xs font-semibold">Düzenle</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-red-500/80 hover:text-red-600 hover:bg-red-500/10 h-9"
                    onClick={() => onDelete(subscription.id)}
                    title="Sil"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span className="text-xs font-semibold">Sil</span>
                </Button>
            </CardFooter>
        </Card>
    );
}
