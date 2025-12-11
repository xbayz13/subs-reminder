import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { loginWithGoogle } from "@/lib/api";
import { LogIn, Calendar, Bell, Shield, Sparkles } from "lucide-react";

/**
 * Login Page Component
 * 
 * Displays Google OAuth login button with beautiful design
 */
export function LoginPage() {
  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden md:block space-y-6 animate-in fade-in slide-in-from-left duration-700">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold">Subscription Reminder</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Kelola langganan dan pembayaran Anda dengan mudah
            </p>
          </div>
          
          <div className="space-y-4 pt-8">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Pengingat Otomatis</h3>
                <p className="text-sm text-muted-foreground">
                  Dapatkan notifikasi sebelum tanggal pembayaran tiba
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Integrasi Google Calendar</h3>
                <p className="text-sm text-muted-foreground">
                  Sinkronkan dengan Google Calendar untuk akses mudah
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Aman & Privat</h3>
                <p className="text-sm text-muted-foreground">
                  Data Anda terlindungi dengan autentikasi Google
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Card */}
        <div className="animate-in fade-in slide-in-from-right duration-700">
          <Card className="w-full shadow-xl border-2">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <div className="md:hidden">
                <CardTitle className="text-3xl font-bold">Subscription Reminder</CardTitle>
              </div>
              <CardTitle className="text-2xl font-bold hidden md:block">Selamat Datang</CardTitle>
              <CardDescription className="text-base">
                Login dengan Google untuk mulai mengelola langganan Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                onClick={handleGoogleLogin}
                className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                size="lg"
              >
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Login dengan Google
              </Button>
              
              <Separator />
              
              <div className="space-y-2">
                <p className="text-xs text-center text-muted-foreground">
                  Dengan login, Anda menyetujui penggunaan Google Calendar untuk pengingat pembayaran
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  <span>Data Anda aman dan terenkripsi</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

