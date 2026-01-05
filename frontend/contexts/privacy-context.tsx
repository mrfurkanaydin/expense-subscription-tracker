"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
} from "react";

interface PrivacyContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

const STORAGE_KEY = "expense_tracker_privacy_mode";

// External store for SSR-safe localStorage sync
const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getSnapshot = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
};

const getServerSnapshot = (): boolean => false;

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const isPrivacyMode = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const togglePrivacyMode = useCallback(() => {
    const newValue = !getSnapshot();
    localStorage.setItem(STORAGE_KEY, String(newValue));
    // Dispatch storage event for cross-tab sync and re-render
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  }, []);

  return (
    <PrivacyContext.Provider value={{ isPrivacyMode, togglePrivacyMode }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error("usePrivacy must be used within a PrivacyProvider");
  }
  return context;
}

/**
 * Masks a currency value when privacy mode is enabled.
 * Returns asterisks in place of digits while keeping the currency symbol.
 */
export function maskCurrency(formatted: string): string {
  return formatted.replace(/[\d.,]+/g, "****");
}
