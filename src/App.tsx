import { useState, useEffect, lazy, Suspense, useCallback, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { LoginPage } from "@/components/auth/LoginPage";
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm";
import { PaymentConfirmation } from "@/components/calendar/PaymentConfirmation";
import { Toaster } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import "./index.css";

// Lazy load heavy components for code splitting
const Dashboard = lazy(() => import("@/components/dashboard/Dashboard").then(m => ({ default: m.Dashboard })));
const SubscriptionList = lazy(() => import("@/components/subscriptions/SubscriptionList").then(m => ({ default: m.SubscriptionList })));
const ProfilePage = lazy(() => import("@/components/profile/ProfilePage").then(m => ({ default: m.ProfilePage })));
const InstallmentsPage = lazy(() => import("@/components/installments/InstallmentsPage").then(m => ({ default: m.InstallmentsPage })));
const ConfirmPaymentPage = lazy(() => import("@/components/installments/ConfirmPaymentPage").then(m => ({ default: m.ConfirmPaymentPage })));
const PrivacyPolicy = lazy(() => import("@/components/legal/PrivacyPolicy").then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import("@/components/legal/TermsOfService").then(m => ({ default: m.TermsOfService })));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-muted-foreground text-sm">Memuat halaman...</p>
    </div>
  </div>
);

type Page = "login" | "dashboard" | "subscriptions" | "profile" | "installments" | "confirm-payment" | "privacy-policy" | "terms-of-service";

/**
 * Main App Component
 * 
 * Handles routing and page navigation
 */
export function App() {
  const { user, loading, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  // Public pages that don't require authentication
  const publicPages = ["privacy-policy", "terms-of-service"];

  // Check for payment confirmation link, confirm-payment page, or legal pages
  // This runs on mount and when URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const link = urlParams.get("confirm") || urlParams.get("link");
    const hash = window.location.hash.replace("#", "");
    const pathname = window.location.pathname;
    
    // Check for legal pages first (public, no auth required)
    // These pages should be accessible without authentication
    if (pathname === "/privacy-policy" || hash === "privacy-policy") {
      setCurrentPage("privacy-policy");
      return;
    }
    
    if (pathname === "/terms-of-service" || hash === "terms-of-service") {
      setCurrentPage("terms-of-service");
      return;
    }
    
    if (hash === "confirm-payment" || link) {
      if (link) {
        setPaymentLink(decodeURIComponent(link));
        setCurrentPage("confirm-payment");
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname + "#confirm-payment");
      } else {
        setCurrentPage("confirm-payment");
      }
      return;
    }
  }, []);

  // Listen for hash changes (for SPA navigation)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      const pathname = window.location.pathname;
      
      if (pathname === "/privacy-policy" || hash === "privacy-policy") {
        setCurrentPage("privacy-policy");
      } else if (pathname === "/terms-of-service" || hash === "terms-of-service") {
        setCurrentPage("terms-of-service");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Update page based on auth state (only if not on public page)
  useEffect(() => {
    if (!loading) {
      // Don't override if already on a public page
      if (publicPages.includes(currentPage)) {
        return;
      }
      // Don't override if on confirm-payment page
      if (currentPage === "confirm-payment") {
        return;
      }
      setCurrentPage(isAuthenticated ? "dashboard" : "login");
    }
  }, [isAuthenticated, loading, currentPage]);

  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page as Page);
  }, []);

  const handleCreateSubscription = useCallback(() => {
    setEditingSubscription(null);
    setShowSubscriptionForm(true);
  }, []);

  const handleEditSubscription = useCallback((subscription: any) => {
    setEditingSubscription(subscription);
    setShowSubscriptionForm(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setShowSubscriptionForm(false);
    setEditingSubscription(null);
    // Trigger re-render by updating a key or state if needed
    // No need for full page reload
  }, []);

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

  // Check if current page is public (doesn't require auth)
  const isPublicPage = publicPages.includes(currentPage);

  // Show login page if not authenticated (except for public pages)
  if (currentPage === "login" || (!isAuthenticated && !isPublicPage && currentPage !== "confirm-payment")) {
    return <LoginPage />;
  }

  return (
    <>
      <Toaster position="top-right" richColors expand={true} />
      
      {currentPage === "privacy-policy" ? (
        <Suspense fallback={<PageLoader />}>
          <PrivacyPolicy />
        </Suspense>
      ) : currentPage === "terms-of-service" ? (
        <Suspense fallback={<PageLoader />}>
          <TermsOfService />
        </Suspense>
      ) : currentPage === "confirm-payment" ? (
        <Suspense fallback={<PageLoader />}>
          <ConfirmPaymentPage
            link={paymentLink || undefined}
            onSuccess={() => {
              setPaymentLink(null);
              setCurrentPage("installments");
            }}
            onCancel={() => {
              setPaymentLink(null);
              setCurrentPage("installments");
            }}
          />
        </Suspense>
      ) : (
        <Layout currentPage={currentPage} onNavigate={handleNavigate}>
          <Suspense fallback={<PageLoader />}>
            {currentPage === "dashboard" && <Dashboard />}
            {currentPage === "subscriptions" && (
              <SubscriptionList
                onCreateClick={handleCreateSubscription}
                onEditClick={handleEditSubscription}
              />
            )}
            {currentPage === "profile" && <ProfilePage />}
            {currentPage === "installments" && <InstallmentsPage />}
          </Suspense>
        </Layout>
      )}

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
