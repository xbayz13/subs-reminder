import { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSubscriptions, deleteSubscription, getUserProfile } from "@/lib/api";
import { Plus, Trash2, Edit, Calendar, AlertCircle, Inbox } from "lucide-react";
import type { SubscriptionType, ReminderStart } from "@/domain/subscriptions/entities/Subscription";
import { formatCurrency, type CurrencyCode } from "@/lib/currency";

interface Subscription {
  uuid: string;
  name: string;
  description: string | null;
  day: number;
  month: number | null;
  price: number;
  type: SubscriptionType;
  reminderStart: ReminderStart;
  lastday: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionListProps {
  onCreateClick: () => void;
  onEditClick: (subscription: Subscription) => void;
}

/**
 * Subscription List Component
 * 
 * Displays list of subscriptions with CRUD operations
 */
export function SubscriptionList({ onCreateClick, onEditClick }: SubscriptionListProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>("IDR");

  useEffect(() => {
    // Load currency and subscriptions in parallel
    Promise.all([
      getUserProfile().then(response => {
        if (response.data) {
          const profileData = response.data.data || response.data;
          setCurrency((profileData.currency || "IDR") as CurrencyCode);
        }
      }).catch(() => setCurrency("IDR")),
      loadSubscriptions()
    ]);
  }, []);

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await getSubscriptions(false);
    
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      // API returns { data: { data: [...] } }, so we need to extract the nested data
      const subscriptionsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.data || []);
      
      // Ensure it's an array
      if (Array.isArray(subscriptionsData)) {
        setSubscriptions(subscriptionsData);
      } else {
        console.error("[SubscriptionList] Invalid data format:", subscriptionsData);
        setError("Invalid data format received from server");
      }
    }
    setLoading(false);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus langganan ini?")) {
      return;
    }

    const response = await deleteSubscription(id);
    if (response.error) {
      alert(`Error: ${response.error}`);
    } else {
      loadSubscriptions();
    }
  }, [loadSubscriptions]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  const getMonthName = useCallback((month: number): string => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return months[month - 1] || "";
  }, []);

  const formatReminder = useCallback((reminder: ReminderStart) => {
    const map: Record<ReminderStart, string> = {
      D_0: "Hari yang sama",
      D_1: "1 hari sebelumnya",
      D_3: "3 hari sebelumnya",
      D_7: "7 hari sebelumnya",
      D_14: "14 hari sebelumnya",
    };
    return map[reminder] || reminder;
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error loading subscriptions:</strong> {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Kelola langganan Anda</p>
        </div>
        <Button 
          onClick={onCreateClick} 
          size="lg" 
          className="shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Tambah Langganan</span>
          <span className="sm:hidden">Tambah</span>
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Inbox className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Belum ada langganan</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
              Mulai dengan menambahkan langganan pertama Anda untuk melacak pembayaran rutin
            </p>
            <Button onClick={onCreateClick} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Langganan Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => (
            <Card 
              key={sub.uuid} 
              className="hover:shadow-lg transition-all duration-200 hover:border-primary/50 group"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {sub.name}
                  </CardTitle>
                  <Badge 
                    variant={sub.type === "MONTHLY" ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {sub.type === "MONTHLY" ? "Bulanan" : "Tahunan"}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold text-primary">
                    {formatCurrency(sub.price, currency)}
                  </span>
                </div>
                {sub.description && (
                  <CardDescription className="mt-2 line-clamp-2">
                    {sub.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Tanggal:</span>
                    </div>
                    <span className="font-medium">
                      {sub.type === "MONTHLY" 
                        ? `Tanggal ${sub.day} setiap bulan`
                        : `${sub.day} ${getMonthName(sub.month || 1)} setiap tahun`
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-muted-foreground">Pengingat:</span>
                    <Badge variant="outline" className="text-xs">
                      {formatReminder(sub.reminderStart)}
                    </Badge>
                  </div>
                  {sub.lastday && (
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-muted-foreground">Berakhir:</span>
                      <span className="font-medium">{formatDate(sub.lastday)}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditClick(sub)}
                    className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(sub.uuid)}
                    className="flex-1 hover:bg-destructive/90 transition-colors"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

