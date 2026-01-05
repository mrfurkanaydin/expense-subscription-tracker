"use client";

import { useCallback } from "react";
import { usePrivacy, maskCurrency } from "@/contexts/privacy-context";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/format";

/**
 * Hook that returns a formatCurrency function respecting privacy mode.
 * Use this instead of importing formatCurrency directly in components.
 */
export function useFormatCurrency() {
  const { isPrivacyMode } = usePrivacy();

  const formatCurrency = useCallback(
    (amount: number, currency: string): string => {
      const formatted = formatCurrencyUtil(amount, currency);
      return isPrivacyMode ? maskCurrency(formatted) : formatted;
    },
    [isPrivacyMode]
  );

  return { formatCurrency, isPrivacyMode };
}
