"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import type { MonthlyData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/format";

interface MonthlyBarChartProps {
    data: MonthlyData[];
    currency?: string;
    showAverage?: boolean;
}

export function MonthlyBarChart({
    data,
    currency = "TRY",
    showAverage = true,
}: MonthlyBarChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Veri bulunamadı
            </div>
        );
    }

    const average =
        data.reduce((sum, item) => sum + item.total, 0) / data.length;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold text-sm mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value, currency)}
                        </p>
                    ))}
                    <p className="text-sm font-medium mt-1 pt-1 border-t border-border">
                        Toplam: {formatCurrency(payload[0]?.payload?.total || 0, currency)}
                    </p>
                </div>
            );
        }
        return null;
    };

    const formatYAxis = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}K`;
        }
        return value.toString();
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                    dataKey="monthLabel"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                />
                <YAxis
                    tickFormatter={formatYAxis}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                    dataKey="expenses"
                    name="Giderler"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                />
                <Bar
                    dataKey="subscriptions"
                    name="Abonelikler"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                />
                {showAverage && (
                    <ReferenceLine
                        y={average}
                        stroke="#f59e0b"
                        strokeDasharray="5 5"
                        label={{
                            value: "Ortalama",
                            position: "right",
                            fill: "#f59e0b",
                            fontSize: 12,
                        }}
                    />
                )}
            </BarChart>
        </ResponsiveContainer>
    );
}
