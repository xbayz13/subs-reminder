import { useState, useEffect, useRef } from "react";
import { getCurrentUser } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

interface User {
  uuid: string;
  email: string;
  name: string;
  avatar?: string | null;
  googleId: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for authentication
 * 
 * Manages user authentication state and provides methods to check auth status.
 * Handles OAuth callback and session verification.
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  
  const toast = useToast();
  const mountedRef = useRef(true);
  const checkingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Check authentication status
   */
  const checkAuth = async (showToasts = true) => {
    // Prevent concurrent checks
    if (checkingRef.current) {
      return;
    }

    checkingRef.current = true;

    try {
      // Check for OAuth callback
      const urlParams = new URLSearchParams(window.location.search);
      const loginSuccess = urlParams.get("login");

      if (loginSuccess === "success") {
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);
        
        if (showToasts) {
          toast.info("Login berhasil! Memverifikasi sesi...", 2000);
        }
        
        // Wait a bit for cookie to be set
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const response = await getCurrentUser();
      const user = response.data?.data || response.data;

      if (user && user.email) {
        if (mountedRef.current) {
          setAuthState({
            user,
            loading: false,
            error: null,
          });

          if (showToasts && loginSuccess !== "success") {
            toast.success(`Selamat datang, ${user.name || user.email}!`);
          }
        }
      } else {
        if (mountedRef.current) {
          setAuthState({
            user: null,
            loading: false,
            error: response.error || "Not authenticated",
          });

          if (showToasts && loginSuccess === "success") {
            toast.error("Gagal memverifikasi sesi. Silakan coba login lagi.");
          }
        }
      }
    } catch (error) {
      if (mountedRef.current) {
        setAuthState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        if (showToasts) {
          toast.error("Error: " + (error instanceof Error ? error.message : "Unknown error"));
        }
      }
    } finally {
      checkingRef.current = false;
    }
  };

  // Initial auth check on mount
  useEffect(() => {
    checkAuth();
  }, []); // Only run once on mount

  return {
    ...authState,
    checkAuth,
    isAuthenticated: authState.user !== null,
  };
}

