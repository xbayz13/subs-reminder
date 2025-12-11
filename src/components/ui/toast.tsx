/**
 * Toast Component using Sonner
 * 
 * Replaces the deprecated custom toast implementation with Sonner
 * Based on Shadcn UI documentation: https://ui.shadcn.com/docs/components/sonner
 */

import { toast as sonnerToast } from "sonner";

/**
 * Toast utility functions
 * 
 * Provides a consistent API for showing toast notifications
 */
export const toast = {
  /**
   * Show success toast
   */
  success: (message: string, duration?: number) => {
    return sonnerToast.success(message, {
      duration: duration || 5000,
    });
  },

  /**
   * Show error toast
   */
  error: (message: string, duration?: number) => {
    return sonnerToast.error(message, {
      duration: duration || 7000,
    });
  },

  /**
   * Show info toast
   */
  info: (message: string, duration?: number) => {
    return sonnerToast.info(message, {
      duration: duration || 5000,
    });
  },

  /**
   * Show warning toast
   */
  warning: (message: string, duration?: number) => {
    return sonnerToast.warning(message, {
      duration: duration || 5000,
    });
  },
};

/**
 * Hook for backward compatibility
 * 
 * @deprecated Use `toast` directly instead
 */
export function useToast() {
  return {
    success: toast.success,
    error: toast.error,
    info: toast.info,
    warning: toast.warning,
    // Legacy properties for backward compatibility
    toasts: [],
    closeToast: () => {},
  };
}
