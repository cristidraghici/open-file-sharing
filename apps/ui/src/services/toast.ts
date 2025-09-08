import { toast } from "react-toastify";

/**
 * Utility service for showing toast notifications
 */
export const toastService = {
  /**
   * Show success toast
   */
  success: (message: string, options?: any) => {
    toast.success(message, {
      className: "toast-success",
      progressClassName: "!bg-green-500",
      ...options,
    });
  },

  /**
   * Show error toast
   */
  error: (message: string, options?: any) => {
    toast.error(message, {
      className: "toast-error",
      progressClassName: "!bg-red-500",
      autoClose: 7000, // Keep error messages a bit longer
      ...options,
    });
  },

  /**
   * Show warning toast
   */
  warning: (message: string, options?: any) => {
    toast.warning(message, {
      className: "toast-warning",
      progressClassName: "!bg-yellow-500",
      ...options,
    });
  },

  /**
   * Show info toast
   */
  info: (message: string, options?: any) => {
    toast.info(message, {
      className: "toast-info",
      progressClassName: "!bg-blue-500",
      ...options,
    });
  },

  /**
   * Show loading toast that can be updated
   */
  loading: (message: string = "Loading...") => {
    return toast.loading(message, {
      className: "toast-loading",
    });
  },

  /**
   * Update a loading toast to success
   */
  updateToSuccess: (toastId: any, message: string) => {
    toast.update(toastId, {
      render: message,
      type: "success",
      isLoading: false,
      autoClose: 5000,
      className: "toast-success",
      progressClassName: "!bg-green-500",
    });
  },

  /**
   * Update a loading toast to error
   */
  updateToError: (toastId: any, message: string) => {
    toast.update(toastId, {
      render: message,
      type: "error",
      isLoading: false,
      autoClose: 7000,
      className: "toast-error",
      progressClassName: "!bg-red-500",
    });
  },

  /**
   * Dismiss a toast
   */
  dismiss: (toastId?: any) => {
    toast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.dismiss();
  },
};

/**
 * Extract error message from various error formats
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return "An unexpected error occurred";
};
