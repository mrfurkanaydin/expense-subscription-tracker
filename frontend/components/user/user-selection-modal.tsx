"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createUser, getUserByEmail } from "@/lib/api";
import { useUser } from "@/contexts/user-context";
import { Loader2, LogIn } from "lucide-react";

export function UserSelectionModal() {
  const { setUser } = useUser();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Email gereklidir");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const trimmedEmail = email.trim();
      
      // Önce mevcut kullanıcıyı kontrol et
      const existingUser = await getUserByEmail(trimmedEmail);
      
      if (existingUser) {
        // Mevcut kullanıcıyı seç
        setUser(existingUser);
      } else {
        // Yeni kullanıcı oluştur
        const newUser = await createUser(trimmedEmail);
        setUser(newUser);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Bir hata oluştu"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Giriş Yap</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Email adresinizi girin. Mevcut kullanıcıysanız giriş yapılacak, yoksa yeni kullanıcı oluşturulacak.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="ornek@email.com"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
                required
              />
              {error && (
                <p className="text-xs text-red-600 mt-1.5">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kontrol ediliyor...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Giriş Yap / Kayıt Ol
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

