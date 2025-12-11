import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { confirmPaymentFromLink } from "@/lib/api";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";

interface PaymentConfirmationProps {
  link: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Payment Confirmation Component
 * 
 * Handles payment confirmation from Google Calendar link
 */
export function PaymentConfirmation({ link, onSuccess, onCancel }: PaymentConfirmationProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-confirm if link is provided
    if (link) {
      handleConfirm();
    }
  }, [link]);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await confirmPaymentFromLink(link);
      
      if (response.error) {
        setError(response.error);
      } else {
        setSuccess(true);
        if (onSuccess) {
          setTimeout(() => onSuccess(), 2000);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground font-medium">Mengonfirmasi pembayaran...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border-green-500/20">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-3xl mb-3 text-green-600 dark:text-green-400">
              Pembayaran Dikonfirmasi!
            </CardTitle>
            <CardDescription className="text-center text-base">
              Pembayaran Anda telah berhasil dikonfirmasi.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl">Konfirmasi Pembayaran</CardTitle>
          <CardDescription className="text-base mt-1">
            Apakah Anda sudah melakukan pembayaran untuk langganan ini?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleConfirm}
              className="flex-1 h-11"
              disabled={loading}
              size="lg"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Ya, Sudah Dibayar
            </Button>
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1 h-11"
                disabled={loading}
                size="lg"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Batal
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

