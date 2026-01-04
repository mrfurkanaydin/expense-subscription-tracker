import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import type {
  Expense,
  Subscription,
  CategoryData,
  ReportSummary,
} from "../types";

/**
 * Export expenses to CSV
 */
export function exportToCSV(
  expenses: Expense[],
  filename: string = "giderler"
): void {
  const headers = ["Başlık", "Tutar", "Para Birimi", "Kategori", "Tarih"];

  const rows = expenses.map((expense) => [
    expense.title,
    expense.amount.toString(),
    expense.currency,
    expense.category,
    format(new Date(expense.created_at), "dd.MM.yyyy"),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  // Add BOM for Turkish character support
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  downloadBlob(blob, `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`);
}

/**
 * Export subscriptions to CSV
 */
export function exportSubscriptionsToCSV(
  subscriptions: Subscription[],
  filename: string = "abonelikler"
): void {
  const headers = [
    "Başlık",
    "Tutar",
    "Para Birimi",
    "Periyot",
    "Durum",
    "Sonraki Ödeme",
  ];

  const rows = subscriptions.map((sub) => [
    sub.title,
    sub.amount.toString(),
    sub.currency,
    sub.billing_period === "monthly" ? "Aylık" : "Yıllık",
    sub.active ? "Aktif" : "Pasif",
    format(new Date(sub.next_billing_at), "dd.MM.yyyy"),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  downloadBlob(blob, `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`);
}

/**
 * Export report to PDF
 */
export function exportToPDF(
  expenses: Expense[],
  subscriptions: Subscription[],
  summary: ReportSummary,
  categoryData: CategoryData[],
  dateRangeLabel: string
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.text("Finansal Rapor", pageWidth / 2, 20, { align: "center" });

  // Date range
  doc.setFontSize(12);
  doc.text(`Dönem: ${dateRangeLabel}`, pageWidth / 2, 30, { align: "center" });
  doc.text(
    `Oluşturulma: ${format(new Date(), "d MMMM yyyy", { locale: tr })}`,
    pageWidth / 2,
    37,
    { align: "center" }
  );

  // Summary section
  doc.setFontSize(14);
  doc.text("Özet", 14, 50);

  doc.setFontSize(11);
  const summaryData = [
    ["Toplam Gider", formatCurrency(summary.totalExpenses)],
    ["Gider Sayısı", summary.expenseCount.toString()],
    ["Ortalama Aylık Gider", formatCurrency(summary.averageMonthlyExpense)],
    [
      "En Yüksek Kategori",
      `${summary.topCategory} (${formatCurrency(summary.topCategoryAmount)})`,
    ],
    ["Yıllık Abonelik Maliyeti", formatCurrency(summary.totalSubscriptions)],
  ];

  autoTable(doc, {
    startY: 55,
    head: [],
    body: summaryData,
    theme: "plain",
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { cellWidth: 60 },
    },
  });

  // Category breakdown
  const finalY = (doc as any).lastAutoTable.finalY || 100;
  doc.setFontSize(14);
  doc.text("Kategori Dağılımı", 14, finalY + 15);

  const categoryTableData = categoryData.map((cat) => [
    cat.category,
    formatCurrency(cat.amount),
    `%${cat.percentage.toFixed(1)}`,
  ]);

  autoTable(doc, {
    startY: finalY + 20,
    head: [["Kategori", "Tutar", "Oran"]],
    body: categoryTableData,
    theme: "striped",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [99, 102, 241] },
  });

  // Recent expenses (last 20)
  const expensesY = (doc as any).lastAutoTable.finalY || 150;

  if (expensesY < 220) {
    doc.setFontSize(14);
    doc.text("Son Giderler", 14, expensesY + 15);

    const recentExpenses = expenses
      .slice()
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 15);

    const expenseTableData = recentExpenses.map((exp) => [
      exp.title.length > 25 ? exp.title.substring(0, 25) + "..." : exp.title,
      exp.category,
      formatCurrency(exp.amount),
      format(new Date(exp.created_at), "dd.MM.yyyy"),
    ]);

    autoTable(doc, {
      startY: expensesY + 20,
      head: [["Başlık", "Kategori", "Tutar", "Tarih"]],
      body: expenseTableData,
      theme: "striped",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [99, 102, 241] },
    });
  }

  // New page for subscriptions if needed
  if (subscriptions.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Abonelikler", 14, 20);

    const subTableData = subscriptions.map((sub) => [
      sub.title,
      sub.billing_period === "monthly" ? "Aylık" : "Yıllık",
      formatCurrency(sub.amount),
      sub.active ? "Aktif" : "Pasif",
      format(new Date(sub.next_billing_at), "dd.MM.yyyy"),
    ]);

    autoTable(doc, {
      startY: 25,
      head: [["Başlık", "Periyot", "Tutar", "Durum", "Sonraki Ödeme"]],
      body: subTableData,
      theme: "striped",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [99, 102, 241] },
    });
  }

  // Save PDF
  doc.save(`rapor_${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

/**
 * Helper to download blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format currency for PDF (without Intl for consistency)
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}
