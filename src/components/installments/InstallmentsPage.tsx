import { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getInstallments, markInstallmentAsPaid, getSubscriptions, getUserProfile } from "@/lib/api";
import { formatCurrency, type CurrencyCode } from "@/lib/currency";
import { Calendar, CheckCircle2, XCircle, AlertCircle, Clock, Inbox, Filter } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface Installment {
  uuid: string;
  subscriptionId: string;
  date: string;
  link: string | null;
  paid: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Subscription {
  uuid: string;
  name: string;
  price: number;
}

type FilterType = "all" | "paid" | "unpaid" | "overdue" | "upcoming";

/**
 * Installments Page Component
 * 
 * Displays list of installments/payments with filtering and payment confirmation
 */
export function InstallmentsPage() {
  const toast = useToast();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Record<string, Subscription>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>("IDR");
  const [filter, setFilter] = useState<FilterType>("all");
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load all data in parallel for better performance
      const [currencyResponse, subsResponse, instResponse] = await Promise.all([
        getUserProfile(),
        getSubscriptions(false),
        getInstallments()
      ]);

      // Set currency
      if (currencyResponse.data) {
        const profileData = currencyResponse.data.data || currencyResponse.data;
        setCurrency((profileData.currency || "IDR") as CurrencyCode);
      }

      // Set subscriptions
      if (subsResponse.data) {
        const subsData = Array.isArray(subsResponse.data) 
          ? subsResponse.data 
          : (subsResponse.data.data || []);
        
        const subsMap: Record<string, Subscription> = {};
        subsData.forEach((sub: any) => {
          subsMap[sub.uuid] = {
            uuid: sub.uuid,
            name: sub.name,
            price: parseFloat(sub.price),
          };
        });
        setSubscriptions(subsMap);
      }

      // Set installments
      if (instResponse.error) {
        setError(instResponse.error);
      } else if (instResponse.data) {
        const instData = Array.isArray(instResponse.data)
          ? instResponse.data
          : (instResponse.data.data || []);
        setInstallments(instData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMarkAsPaid = useCallback(async (id: string) => {
    console.log("[InstallmentsPage] handleMarkAsPaid called with id:", id);
    
    if (!confirm("Apakah Anda yakin ingin menandai pembayaran ini sebagai sudah dibayar?")) {
      console.log("[InstallmentsPage] User cancelled confirmation");
      return;
    }

    console.log("[InstallmentsPage] Marking installment as paid:", id);
    setMarkingPaid(id);
    
    try {
      console.log("[InstallmentsPage] Calling markInstallmentAsPaid API...");
      const response = await markInstallmentAsPaid(id);
      console.log("[InstallmentsPage] API response:", response);
      
      if (response.error) {
        console.error("[InstallmentsPage] Error marking as paid:", response.error);
        toast.error(`Gagal menandai pembayaran: ${response.error}`);
      } else {
        console.log("[InstallmentsPage] Successfully marked as paid, updating state");
        toast.success("Pembayaran berhasil ditandai sebagai sudah dibayar");
        // Update installments state directly instead of reloading
        setInstallments(prev => prev.map(inst => 
          inst.uuid === id ? { ...inst, paid: true } : inst
        ));
      }
    } catch (err) {
      console.error("[InstallmentsPage] Exception marking as paid:", err);
      toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setMarkingPaid(null);
    }
  }, [toast]);

  const getInstallmentStatus = useCallback((installment: Installment): "paid" | "overdue" | "upcoming" | "normal" => {
    if (installment.paid) return "paid";
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const paymentDate = new Date(installment.date);
    paymentDate.setHours(0, 0, 0, 0);
    
    if (paymentDate < today) return "overdue";
    if (paymentDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) return "upcoming";
    return "normal";
  }, []);

  const filteredInstallments = useMemo(() => installments.filter((inst) => {
    if (filter === "all") return true;
    if (filter === "paid") return inst.paid;
    if (filter === "unpaid") return !inst.paid;
    if (filter === "overdue") return getInstallmentStatus(inst) === "overdue";
    if (filter === "upcoming") return getInstallmentStatus(inst) === "upcoming";
    return true;
  }), [installments, filter, getInstallmentStatus]);

  // Sort by date (newest first for paid, oldest first for unpaid)
  const sortedInstallments = useMemo(() => [...filteredInstallments].sort((a, b) => {
    if (a.paid !== b.paid) {
      return a.paid ? 1 : -1; // Unpaid first
    }
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return a.paid ? dateB - dateA : dateA - dateB; // Newest first for paid, oldest first for unpaid
  }), [filteredInstallments]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = (installment: Installment) => {
    const status = getInstallmentStatus(installment);
    
    if (status === "paid") {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Dibayar
        </Badge>
      );
    }
    
    if (status === "overdue") {
      return (
        <Badge variant="destructive">
          <AlertCircle className="mr-1 h-3 w-3" />
          Terlambat
        </Badge>
      );
    }
    
    if (status === "upcoming") {
      return (
        <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white">
          <Clock className="mr-1 h-3 w-3" />
          Mendatang
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline">
        <Calendar className="mr-1 h-3 w-3" />
        Belum Dibayar
      </Badge>
    );
  };

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
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
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
            <strong>Error loading installments:</strong> {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Installments</h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Daftar pembayaran langganan</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="unpaid">Belum Dibayar</SelectItem>
              <SelectItem value="paid">Sudah Dibayar</SelectItem>
              <SelectItem value="overdue">Terlambat</SelectItem>
              <SelectItem value="upcoming">Mendatang</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {sortedInstallments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Inbox className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {filter === "all" ? "Belum ada pembayaran" : `Tidak ada pembayaran ${filter === "paid" ? "yang sudah dibayar" : filter === "unpaid" ? "yang belum dibayar" : filter === "overdue" ? "yang terlambat" : "yang mendatang"}`}
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
              {filter === "all" 
                ? "Pembayaran akan muncul setelah Anda membuat langganan dan generate installments"
                : "Coba ubah filter untuk melihat pembayaran lainnya"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedInstallments.map((installment) => {
            const subscription = subscriptions[installment.subscriptionId];
            const status = getInstallmentStatus(installment);
            const isOverdue = status === "overdue";
            
            return (
              <Card 
                key={installment.uuid}
                className={`hover:shadow-lg transition-all duration-200 ${
                  isOverdue && !installment.paid 
                    ? "border-red-500/50 bg-red-50/50 dark:bg-red-950/10" 
                    : installment.paid
                    ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/10"
                    : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">
                          {subscription?.name || "Unknown Subscription"}
                        </CardTitle>
                        {getStatusBadge(installment)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Tanggal Pembayaran: {formatDate(installment.date)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {subscription ? formatCurrency(subscription.price, currency) : "N/A"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {installment.link && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Calendar Link:</span>{" "}
                          <a 
                            href={installment.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline break-all"
                          >
                            {installment.link.length > 60 
                              ? `${installment.link.substring(0, 60)}...` 
                              : installment.link}
                          </a>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Dibuat: {new Date(installment.createdAt).toLocaleDateString("id-ID")}
                      </div>
                    </div>
                    {!installment.paid && (
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("[InstallmentsPage] Button clicked for installment:", installment.uuid);
                          handleMarkAsPaid(installment.uuid);
                        }}
                        disabled={markingPaid === installment.uuid}
                        variant={isOverdue ? "destructive" : "default"}
                        size="sm"
                        className="shrink-0"
                        type="button"
                      >
                        {markingPaid === installment.uuid ? (
                          <>
                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                            Memproses...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Tandai Dibayar
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

