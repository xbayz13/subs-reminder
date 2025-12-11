import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createSubscription, updateSubscription } from "@/lib/api";
import type { SubscriptionType, ReminderStart } from "@/domain/subscriptions/entities/Subscription";
import { X, AlertCircle, Loader2 } from "lucide-react";

interface SubscriptionFormProps {
  subscription?: {
    uuid: string;
    name: string;
    description: string | null;
    day: number;
    month: number | null;
    price: number;
    type: SubscriptionType;
    reminderStart: ReminderStart;
    lastday: string | null;
  };
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Subscription Form Component
 * 
 * Form untuk create/edit subscription
 */
export function SubscriptionForm({ subscription, onClose, onSuccess }: SubscriptionFormProps) {
  const isEdit = !!subscription;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: subscription?.name || "",
    description: subscription?.description || "",
    day: subscription?.day?.toString() || "",
    month: subscription?.month?.toString() || "",
    price: subscription?.price.toString() || "",
    type: subscription?.type || "MONTHLY" as SubscriptionType,
    reminderStart: subscription?.reminderStart || "D_1" as ReminderStart,
    lastday: subscription?.lastday ? new Date(subscription.lastday).toISOString().split("T")[0] : "",
  });

  // TODO: Get userId from auth context
  const userId = "temp-user-id";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const day = parseInt(formData.day);
      if (isNaN(day) || day < 1 || day > 31) {
        setError("Day must be between 1 and 31");
        setLoading(false);
        return;
      }

      const month = formData.type === "YEARLY" 
        ? (formData.month ? parseInt(formData.month) : null)
        : null;
      
      if (formData.type === "YEARLY" && (!month || month < 1 || month > 12)) {
        setError("Month is required and must be between 1 and 12 for yearly subscriptions");
        setLoading(false);
        return;
      }

      const data = {
        name: formData.name,
        description: formData.description || null,
        day,
        month,
        price: parseFloat(formData.price),
        type: formData.type,
        reminderStart: formData.reminderStart,
        lastday: formData.lastday ? new Date(formData.lastday) : null,
      };

      let response;
      if (isEdit) {
        response = await updateSubscription(subscription.uuid, data);
      } else {
        response = await createSubscription(data);
      }

      if (response.error) {
        setError(response.error);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{isEdit ? "Edit" : "Tambah"} Langganan</CardTitle>
              <CardDescription className="text-base mt-1">
                {isEdit ? "Ubah informasi langganan" : "Tambahkan langganan baru"}
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="rounded-full hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nama Langganan *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Contoh: Netflix, Spotify"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi langganan (opsional)"
                rows={3}
              />
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="day">Tanggal Jatuh Tempo (Hari) *</Label>
                <Input
                  id="day"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  required
                  placeholder="1-31"
                />
                <p className="text-xs text-muted-foreground">
                  Tanggal setiap bulan/bulan untuk pembayaran
                </p>
              </div>

              {formData.type === "YEARLY" && (
                <div className="space-y-2">
                  <Label htmlFor="month">Bulan Jatuh Tempo *</Label>
                  <Select
                    value={formData.month}
                    onValueChange={(value) => setFormData({ ...formData, month: value })}
                  >
                    <SelectTrigger id="month">
                      <SelectValue placeholder="Pilih bulan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Januari</SelectItem>
                      <SelectItem value="2">Februari</SelectItem>
                      <SelectItem value="3">Maret</SelectItem>
                      <SelectItem value="4">April</SelectItem>
                      <SelectItem value="5">Mei</SelectItem>
                      <SelectItem value="6">Juni</SelectItem>
                      <SelectItem value="7">Juli</SelectItem>
                      <SelectItem value="8">Agustus</SelectItem>
                      <SelectItem value="9">September</SelectItem>
                      <SelectItem value="10">Oktober</SelectItem>
                      <SelectItem value="11">November</SelectItem>
                      <SelectItem value="12">Desember</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Bulan untuk pembayaran tahunan
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="price">Harga *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Tipe Langganan *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => {
                    setFormData({ 
                      ...formData, 
                      type: value as SubscriptionType,
                      month: value === "YEARLY" ? formData.month : ""
                    });
                  }}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Bulanan</SelectItem>
                    <SelectItem value="YEARLY">Tahunan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminderStart">Pengingat *</Label>
                <Select
                  value={formData.reminderStart}
                  onValueChange={(value) => setFormData({ ...formData, reminderStart: value as ReminderStart })}
                >
                  <SelectTrigger id="reminderStart">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="D_0">Hari yang sama</SelectItem>
                    <SelectItem value="D_1">1 hari sebelumnya</SelectItem>
                    <SelectItem value="D_3">3 hari sebelumnya</SelectItem>
                    <SelectItem value="D_7">7 hari sebelumnya</SelectItem>
                    <SelectItem value="D_14">14 hari sebelumnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastday">Tanggal Berakhir (Opsional)</Label>
              <Input
                id="lastday"
                type="date"
                value={formData.lastday}
                onChange={(e) => setFormData({ ...formData, lastday: e.target.value })}
                placeholder="Kosongkan jika tidak ada batas waktu"
              />
              <p className="text-xs text-muted-foreground">
                Biarkan kosong jika langganan tidak memiliki batas waktu
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                disabled={loading}
                className="min-w-[100px]"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  isEdit ? "Update" : "Simpan"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

