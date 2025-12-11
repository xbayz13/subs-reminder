import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { confirmPaymentFromLink } from "@/lib/api";
import { CheckCircle2, XCircle, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ConfirmPaymentPageProps {
  link?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Confirm Payment Page Component
 * 
 * Standalone page for confirming payment from Google Calendar link
 */
export function ConfirmPaymentPage({ link: propLink, onSuccess, onCancel }: ConfirmPaymentPageProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(propLink || null);

  useEffect(() => {
    // Get link from URL params if not provided as prop
    if (!propLink) {
      const urlParams = new URLSearchParams(window.location.search);
      const linkParam = urlParams.get("link") || urlParams.get("confirm");
      if (linkParam) {
        setLink(decodeURIComponent(linkParam));
      } else {
        setError("Link pembayaran tidak ditemukan");
      }
    }
  }, [propLink]);

  const handleConfirm = async () => {
    if (!link) return;

    setLoading(true);
    setError(null);

    try {
      const response = await confirmPaymentFromLink(link);
      
      if (response.error) {
        setError(response.error);
        toast.error(`Gagal mengonfirmasi pembayaran: ${response.error}`);
      } else {
        setSuccess(true);
        toast.success("Pembayaran berhasil dikonfirmasi!");
        
        if (onSuccess) {
          setTimeout(() => onSuccess(), 2000);
        } else {
          // Redirect to installments page after 2 seconds
          setTimeout(() => {
            window.location.href = "/#installments";
          }, 2000);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.location.href = "/#installments";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <CardTitle className="text-xl mb-2">Mengonfirmasi Pembayaran...</CardTitle>
            <CardDescription className="text-center">
              Mohon tunggu sebentar
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md shadow-2xl border-green-500/20">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-3xl mb-3 text-green-600 dark:text-green-400 text-center">
              Pembayaran Dikonfirmasi!
            </CardTitle>
            <CardDescription className="text-center text-base mb-6">
              Pembayaran Anda telah berhasil dikonfirmasi. Anda akan diarahkan ke halaman installments.
            </CardDescription>
            <Button 
              onClick={() => {
                if (onSuccess) {
                  onSuccess();
                } else {
                  window.location.href = "/#installments";
                }
              }} 
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Installments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md shadow-2xl">
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

          {link && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Calendar Link:</p>
              <p className="text-xs text-muted-foreground break-all">{link}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleConfirm}
              className="flex-1 h-11"
              disabled={loading || !link}
              size="lg"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Ya, Sudah Dibayar
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 h-11"
              disabled={loading}
              size="lg"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

