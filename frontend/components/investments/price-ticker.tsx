"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceTickerProps {
    price: number;
    previousPrice?: number;
    currency?: string;
    size?: "sm" | "md" | "lg";
    showChange?: boolean;
    change?: number;
    changePercent?: number;
}

export function PriceTicker({
    price,
    previousPrice,
    currency = "TRY",
    size = "md",
    showChange = true,
    change = 0,
    changePercent = 0,
}: PriceTickerProps) {
    const [displayPrice, setDisplayPrice] = useState(price);
    const [isIncreasing, setIsIncreasing] = useState<boolean | null>(null);
    const prevPriceRef = useRef(price);

    useEffect(() => {
        if (price !== prevPriceRef.current) {
            setIsIncreasing(price > prevPriceRef.current);
            setDisplayPrice(price);
            prevPriceRef.current = price;

            // Reset animation state after animation completes
            const timer = setTimeout(() => {
                setIsIncreasing(null);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [price]);

    const formatPrice = (p: number) => {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(p);
    };

    const sizeClasses = {
        sm: "text-lg font-semibold",
        md: "text-2xl font-bold",
        lg: "text-4xl font-black tracking-tight",
    };

    const isPositive = change >= 0 || changePercent >= 0;

    return (
        <div className="flex flex-col">
            {/* Main Price */}
            <motion.div
                className={cn(
                    "font-mono transition-colors duration-300",
                    sizeClasses[size],
                    isIncreasing === true && "text-emerald-500",
                    isIncreasing === false && "text-red-500",
                    isIncreasing === null && "text-foreground"
                )}
                animate={{
                    scale: isIncreasing !== null ? [1, 1.02, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
            >
                <AnimatePresence mode="wait">
                    <motion.span
                        key={displayPrice}
                        initial={{ opacity: 0, y: isIncreasing ? 10 : -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: isIncreasing ? -10 : 10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {formatPrice(displayPrice)}
                    </motion.span>
                </AnimatePresence>
            </motion.div>

            {/* Change indicator */}
            {showChange && (
                <motion.div
                    className={cn(
                        "flex items-center gap-1 text-sm font-medium mt-1",
                        isPositive ? "text-emerald-500" : "text-red-500"
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {isPositive ? (
                        <TrendingUp className="h-4 w-4" />
                    ) : (
                        <TrendingDown className="h-4 w-4" />
                    )}
                    <span>
                        {isPositive ? "+" : ""}
                        {change.toFixed(2)} ({isPositive ? "+" : ""}
                        {changePercent.toFixed(2)}%)
                    </span>
                </motion.div>
            )}

            {/* Glow effect on change */}
            {isIncreasing !== null && (
                <motion.div
                    className={cn(
                        "absolute inset-0 rounded-lg opacity-20 blur-xl -z-10",
                        isIncreasing ? "bg-emerald-500" : "bg-red-500"
                    )}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.2, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                />
            )}
        </div>
    );
}
