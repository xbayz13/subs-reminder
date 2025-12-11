import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { getUserProfile, updateUserProfile } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/toast";
import { User, Mail, Globe, Calendar, DollarSign, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface UserProfile {
  uuid: string;
  name: string;
  email: string;
  avatar: string | null;
  country: string | null;
  currency: string;
  birthdate: string | null;
  age: number | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Profile Page Component
 * 
 * Displays user profile information (read-only) and allows currency setting
 */
export function ProfilePage() {
  const { user: authUser, isAuthenticated } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>("IDR");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserProfile();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // API returns { data: { data: {...} } }, so we need to extract the nested data
        const profileData = (response.data as any).data || response.data;
        setProfile(profileData);
        setCurrency(profileData.currency || "IDR");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated, loadProfile]);

  const handleSaveCurrency = useCallback(async () => {
    if (!profile) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await updateUserProfile({ currency });
      if (response.error) {
        setError(response.error);
        toast.error(`Gagal mengupdate currency: ${response.error}`);
      } else {
        // Reload profile to get updated data
        await loadProfile();
        toast.success(`Currency berhasil diupdate menjadi ${currency}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update currency";
      setError(errorMessage);
      toast.error(`Gagal mengupdate currency: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  }, [profile, currency, toast, loadProfile]);

  const getUserInitials = () => {
    if (!profile?.name) return "U";
    return profile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Tidak diisi";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const currencyOptions = [
    { value: "IDR", label: "IDR - Indonesian Rupiah" },
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "SGD", label: "SGD - Singapore Dollar" },
    { value: "MYR", label: "MYR - Malaysian Ringgit" },
    { value: "JPY", label: "JPY - Japanese Yen" },
    { value: "AUD", label: "AUD - Australian Dollar" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Informasi akun Anda</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error loading profile:</strong> {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Informasi akun dan pengaturan</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Information (Read-only) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>Data diri Anda (read-only dari Google Account)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar || undefined} alt={profile.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              </div>

              <Separator />

              {/* Profile Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Nama</span>
                  </div>
                  <p className="font-medium">{profile.name}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <p className="font-medium">{profile.email}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>Negara</span>
                  </div>
                  <p className="font-medium">{profile.country || "Tidak diisi"}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Tanggal Lahir</span>
                  </div>
                  <p className="font-medium">{formatDate(profile.birthdate)}</p>
                  {profile.age !== null && (
                    <p className="text-xs text-muted-foreground">Umur: {profile.age} tahun</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Account Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Akun dibuat:</span>
                  <span className="font-medium">
                    {new Date(profile.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Terakhir diupdate:</span>
                  <span className="font-medium">
                    {new Date(profile.updatedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Currency Settings */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan</CardTitle>
              <CardDescription>Ubah preferensi aplikasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="currency" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Currency</span>
                </Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Pilih currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Currency yang digunakan untuk menampilkan harga subscription
                </p>
              </div>

              <Button
                onClick={handleSaveCurrency}
                disabled={saving || currency === profile.currency}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>

              {currency === profile.currency && (
                <p className="text-xs text-center text-muted-foreground">
                  Tidak ada perubahan
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

