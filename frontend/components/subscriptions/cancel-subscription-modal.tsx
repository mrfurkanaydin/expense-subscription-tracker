"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"; // Assuming Dialog components are exported from ui/dialog
// Wait, ui/dialog.tsx might not exist as per previous check?
// Step 546 said "no such file".
// I used custom modal overlay in page.tsx.
// I should stick to custom modal overlay to avoid dependency on non-existent component.
// Or create one. But custom overlay is safer.

// Actually I'll create it as a component that renders the overlay itself, similar to EditForm but inside a modal logic?
// No, I'll allow page.tsx to handle the overlay, I just provide the form?
// Or I can make `CancelSubscriptionModal` which includes the overlay div.

import { updateSubscription } from "@/lib/api";
import type { Subscription, UpdateSubscriptionRequest } from "@/lib/types";

interface CancelSubscriptionModalProps {
    subscription: Subscription;
    onSuccess: () => void;
    onCancel: () => void;
}

export function CancelSubscriptionModal({
    subscription,
    onSuccess,
    onCancel,
}: CancelSubscriptionModalProps) {
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        try {
            setIsSubmitting(true);
            const request: UpdateSubscriptionRequest = {
                id: subscription.id,
                active: false,
                end_date: new Date(date).toISOString(),
            };
            await updateSubscription(request);
            onSuccess();
        } catch (error) {
            console.error("Error canceling subscription:", error);
            alert("İptal işlemi başarısız oldu");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-lg p-6 relative z-50">
                <div className="flex flex-col space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold leading-none tracking-tight">
                            Aboneliği İptal Et
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            "{subscription.title}" aboneliğini iptal etmek üzeresiniz.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="end_date" className="text-sm font-medium">
                            Bitiş Tarihi
                        </label>
                        <input
                            id="end_date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        />
                        <p className="text-xs text-muted-foreground">
                            Bu tarihten sonra abonelik pasif duruma geçecek.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                            Vazgeç
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "İptal Ediliyor..." : "Aboneliği İptal Et"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
