"use client";

import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet } from "lucide-react";
import type { Expense, Subscription, CategoryData, ReportSummary } from "@/lib/types";
import { exportToCSV, exportSubscriptionsToCSV, exportToPDF } from "@/lib/utils/export";

interface ExportButtonsProps {
    expenses: Expense[];
    subscriptions: Subscription[];
    summary: ReportSummary;
    categoryData: CategoryData[];
    dateRangeLabel: string;
}

export function ExportButtons({
    expenses,
    subscriptions,
    summary,
    categoryData,
    dateRangeLabel,
}: ExportButtonsProps) {
    const handleExportCSV = () => {
        exportToCSV(expenses);
    };

    const handleExportSubscriptionsCSV = () => {
        exportSubscriptionsToCSV(subscriptions);
    };

    const handleExportPDF = () => {
        exportToPDF(expenses, subscriptions, summary, categoryData, dateRangeLabel);
    };

    return (
        <div className="flex flex-wrap gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={expenses.length === 0}
            >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Giderler CSV
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleExportSubscriptionsCSV}
                disabled={subscriptions.length === 0}
            >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Abonelikler CSV
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={expenses.length === 0 && subscriptions.length === 0}
            >
                <FileDown className="h-4 w-4 mr-2" />
                PDF Rapor
            </Button>
        </div>
    );
}
