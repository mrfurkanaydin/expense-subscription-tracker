"use client";

import { usePrivacy, maskCurrency } from "@/contexts/privacy-context";
import { formatCurrency } from "@/lib/utils/format";

interface PrivateAmountProps {
  amount: number;
  currency: string;
  className?: string;
}

/**
 * Renders a currency amount that respects the global privacy mode.
 * When privacy mode is enabled, displays asterisks instead of the actual amount.
 */
export function PrivateAmount({
  amount,
  currency,
  className,
}: PrivateAmountProps) {
  const { isPrivacyMode } = usePrivacy();
  const formatted = formatCurrency(amount, currency);

  return (
    <span className={className}>
      {isPrivacyMode ? maskCurrency(formatted) : formatted}
    </span>
  );
}
