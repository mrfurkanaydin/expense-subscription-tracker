"use client";

import { Button } from "@/components/ui/button";
import type { DateRange } from "@/lib/types";
import { DATE_RANGE_OPTIONS } from "@/lib/constants";
import { Calendar } from "lucide-react";

interface DateRangePickerProps {
    value: DateRange;
    onChange: (value: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {DATE_RANGE_OPTIONS.map((option) => (
                <Button
                    key={option.value}
                    variant={value === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => onChange(option.value as DateRange)}
                >
                    {option.label}
                </Button>
            ))}
        </div>
    );
}
