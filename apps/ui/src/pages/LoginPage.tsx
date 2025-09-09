import { zodResolver } from "@hookform/resolvers/zod";
import React, { useId } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";
import { toastService } from "../services/toast";
import {
  createAccessibleErrorProps,
  generateAccessibilityId,
} from "../utils/accessibility";

const schema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Generate unique IDs for accessibility
  const usernameId = useId();
  const passwordId = useId();
  const usernameErrorId = generateAccessibilityId("username-error");
  const passwordErrorId = generateAccessibilityId("password-error");

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.username, values.password);
      toastService.success("Successfully logged in!");
      const redirectTo = location?.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      // Error toast is handled by API interceptor
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 safe-area-padding">
      {/* Skip navigation for accessibility */}
      <nav aria-label="Skip navigation" className="skip-navigation">
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>
      </nav>
      
      <main id="main-content" className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <section
            className="card shadow-card-lg"
            aria-labelledby="login-heading"
          >
          {/* Header */}
          <header className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div
                className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg flex items-center justify-center"
                role="img"
                aria-label="Open File Sharing application logo"
              >
                <svg
                  className="h-6 w-6 sm:h-8 sm:w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
              </div>
            </div>
            <h1 id="login-heading" className="heading-1 text-gray-900 mb-2">
              Open File Sharing
            </h1>
            <p className="text-muted">Sign in to your account</p>
          </header>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            autoComplete="on"
            aria-labelledby="login-heading"
            noValidate
          >
            <fieldset className="space-y-6">
              <legend className="sr-only">Login credentials</legend>

              <div className="space-y-2">
                <label
                  htmlFor={usernameId}
                  className="block text-sm font-medium text-gray-700"
                >
                  Username *
                </label>
                <input
                  type="text"
                  id={usernameId}
                  className={`input focus-ring ${
                    errors.username
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                      : ""
                  }`}
                  placeholder="Enter your username"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  inputMode="text"
                  required
                  aria-required="true"
                  {...register("username")}
                  {...createAccessibleErrorProps(
                    usernameErrorId,
                    errors.username?.message
                  )}
                />
                {errors.username && (
                  <div
                    id={usernameErrorId}
                    className="flex items-center mt-2"
                    role="alert"
                    aria-live="polite"
                  >
                    <svg
                      className="h-4 w-4 text-red-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-red-600">
                      {errors.username.message}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={passwordId}
                  className="block text-sm font-medium text-gray-700"
                >
                  Password *
                </label>
                <input
                  type="password"
                  id={passwordId}
                  className={`input focus-ring ${
                    errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                      : ""
                  }`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  aria-required="true"
                  {...register("password")}
                  {...createAccessibleErrorProps(
                    passwordErrorId,
                    errors.password?.message
                  )}
                />
                {errors.password && (
                  <div
                    id={passwordErrorId}
                    className="flex items-center mt-2"
                    role="alert"
                    aria-live="polite"
                  >
                    <svg
                      className="h-4 w-4 text-red-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  </div>
                )}
              </div>
            </fieldset>

            <button
              type="submit"
              className="btn btn-primary w-full touch-target transition-all duration-200 focus-ring"
              disabled={isSubmitting}
              aria-describedby="submit-help"
            >
              {isSubmitting ? (
                <>
                  <div
                    className="loading-spinner h-4 w-4 mr-2"
                    aria-hidden="true"
                  />
                  <span>Signing in...</span>
                  <span className="sr-only">
                    Please wait while we sign you in
                  </span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
            <div id="submit-help" className="sr-only">
              Press Enter or click to sign in to your account
            </div>
          </form>
          </section>
        </div>
      </main>
      
      {/* Footer */}
      <footer
        className="py-4 text-center text-xs text-gray-500"
        role="contentinfo"
      >
        <p>Secure file sharing platform</p>
      </footer>
    </div>
  );
};
