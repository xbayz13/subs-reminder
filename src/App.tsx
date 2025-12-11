import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { LoginPage } from "@/components/auth/LoginPage";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { SubscriptionList } from "@/components/subscriptions/SubscriptionList";
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm";
import { PaymentConfirmation } from "@/components/calendar/PaymentConfirmation";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { ToastContainer, useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import "./index.css";

type Page = "login" | "dashboard" | "subscriptions" | "profile";

/**
 * Main App Component
 * 
 * Handles routing and page navigation
 */
export function App() {
  const toast = useToast();
  const { user, loading, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  // Update page based on auth state
  useEffect(() => {
    if (!loading) {
      setCurrentPage(isAuthenticated ? "dashboard" : "login");
    }
  }, [isAuthenticated, loading]);

  // Check for payment confirmation link
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const link = urlParams.get("confirm");
    if (link) {
      setPaymentLink(decodeURIComponent(link));
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleCreateSubscription = () => {
    setEditingSubscription(null);
    setShowSubscriptionForm(true);
  };

  const handleEditSubscription = (subscription: any) => {
    setEditingSubscription(subscription);
    setShowSubscriptionForm(true);
  };

  const handleFormSuccess = () => {
    setShowSubscriptionForm(false);
    setEditingSubscription(null);
    // Reload subscriptions if on subscriptions page
    if (currentPage === "subscriptions") {
      window.location.reload(); // Simple reload for now
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (currentPage === "login") {
    return <LoginPage />;
  }

  return (
    <>
      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />
      
      <Layout currentPage={currentPage} onNavigate={handleNavigate}>
        {currentPage === "dashboard" && <Dashboard />}
        {currentPage === "subscriptions" && (
          <SubscriptionList
            onCreateClick={handleCreateSubscription}
            onEditClick={handleEditSubscription}
          />
        )}
        {currentPage === "profile" && <ProfilePage />}
      </Layout>

      {showSubscriptionForm && (
        <SubscriptionForm
          subscription={editingSubscription}
          onClose={() => {
            setShowSubscriptionForm(false);
            setEditingSubscription(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {paymentLink && (
        <PaymentConfirmation
          link={paymentLink}
          onSuccess={() => {
            setPaymentLink(null);
            // Reload current page to refresh data
            window.location.reload();
          }}
          onCancel={() => setPaymentLink(null)}
        />
      )}
    </>
  );
}

export default App;
