"use client";

import { useUser } from "@/contexts/user-context";
import { UserSelectionModal } from "@/components/user/user-selection-modal";

export function UserGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return <UserSelectionModal />;
  }

  return <>{children}</>;
}

