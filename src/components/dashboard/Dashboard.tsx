import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getDashboardData, getCurrentUser } from "@/lib/api";
import { Calendar, DollarSign, AlertCircle, CheckCircle2, TrendingUp, Clock, Inbox } from "lucide-react";

interface DashboardData {
  nextPayments: Array<{
    subscription: {
      uuid: string;
      name: string;
      price: number;
    };
    nextPaymentDate: string;
    reminderDate: string;
  }>;
  topSubscriptions: Array<{
    uuid: string;
    name: string;
    price: number;
    type: string;
  }>;
  statistics: {
    totalPaid: number;
    totalOverdue: number;
    totalUpcoming: number;
    totalInstallments: number;
  };
}

/**
 * Dashboard Component
 * 
 * Displays overview of subscriptions, upcoming payments, and statistics
 */
export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    const response = await getDashboardData();
    
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      // API returns { data: { ... } }, so we need to extract the nested data
      const dashboardData = response.data.data || response.data;
      setData(dashboardData);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-16 w-full" />
                  ))}
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
            <strong>Error loading dashboard:</strong> {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data || !data.statistics) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Overview langganan dan pembayaran Anda</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{data.statistics?.totalPaid ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Pembayaran selesai</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{data.statistics?.totalOverdue ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Pembayaran tertunda</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{data.statistics?.totalUpcoming ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Pembayaran mendatang</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{data.statistics?.totalInstallments ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total installments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Next Payments */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Next Payments</CardTitle>
            </div>
            <CardDescription>Pembayaran yang akan datang</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {!data.nextPayments || data.nextPayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">Tidak ada pembayaran mendatang</p>
                </div>
              ) : (
                data.nextPayments.map((payment, index) => (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                      <div className="flex-1">
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {payment.subscription.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.nextPaymentDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-lg text-primary">
                          ${payment.subscription.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {index < data.nextPayments.length - 1 && <Separator className="my-2" />}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Subscriptions */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Top 5 Subscriptions</CardTitle>
            </div>
            <CardDescription>Langganan termahal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {!data.topSubscriptions || data.topSubscriptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Inbox className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">Belum ada langganan</p>
                </div>
              ) : (
                data.topSubscriptions.map((sub, index) => (
                  <div key={sub.uuid} className="group">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                            {sub.name}
                          </p>
                          {index === 0 && (
                            <Badge variant="success" className="text-xs">Top</Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {sub.type.toLowerCase()}
                        </Badge>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-lg text-primary">
                          ${sub.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {index < data.topSubscriptions.length - 1 && <Separator className="my-2" />}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

