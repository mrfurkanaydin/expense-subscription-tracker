"use client";

import { useMemo } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { cn } from "@/lib/utils";

interface SparklineChartProps {
    data: number[];
    color?: string;
    height?: number;
    showGradient?: boolean;
    className?: string;
}

export function SparklineChart({
    data,
    color,
    height = 40,
    showGradient = true,
    className,
}: SparklineChartProps) {
    const chartData = useMemo(() => {
        return data.map((value, index) => ({ value, index }));
    }, [data]);

    // Determine color based on trend
    const isPositive = data.length >= 2 && data[data.length - 1] >= data[0];
    const strokeColor = color || (isPositive ? "#10b981" : "#ef4444");
    const gradientId = useMemo(() => `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`, []);

    if (data.length === 0) {
        return (
            <div
                className={cn("flex items-center justify-center text-muted-foreground text-xs", className)}
                style={{ height }}
            >
                --
            </div>
        );
    }

    return (
        <div className={cn("w-full", className)} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                    <defs>
                        {showGradient && (
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                            </linearGradient>
                        )}
                    </defs>
                    <YAxis domain={["dataMin", "dataMax"]} hide />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={strokeColor}
                        strokeWidth={2}
                        dot={false}
                        animationDuration={500}
                        fill={showGradient ? `url(#${gradientId})` : "none"}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
