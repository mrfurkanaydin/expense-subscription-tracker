"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, User } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Giderler", href: "/expenses" },
  { name: "Abonelikler", href: "/subscriptions" },
];

export function Header() {
  const pathname = usePathname();
  const { user, setUser } = useUser();

  const handleLogout = () => {
    if (confirm("Çıkış yapmak istediğinize emin misiniz?")) {
      setUser(null);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand to-accent group-hover:scale-110 transition-transform duration-200">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
            Expense Tracker
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-1 sm:flex sm:gap-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 hover:scale-105 sm:px-4 relative",
                  isActive
                    ? "text-brand bg-gradient-to-r from-brand/10 to-accent/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {item.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand to-accent rounded-full" />
                )}
              </Link>
              );
            })}
          </nav>

          {user && (
            <div className="flex items-center gap-2 border-l border-border pl-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="max-w-[150px] truncate">{user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Çıkış</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

