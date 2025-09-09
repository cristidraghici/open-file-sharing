import React, { useEffect, useId, useState } from "react";
import { MotionPreferences, ScreenReader } from "../utils/accessibility";

interface AccessibilityPreferencesProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReaderOptimized: boolean;
}

export const AccessibilityPreferences: React.FC<
  AccessibilityPreferencesProps
> = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    highContrast: false,
    reducedMotion: MotionPreferences.prefersReducedMotion(),
    largeText: false,
    screenReaderOptimized: false,
  });

  // Generate unique IDs for form elements
  const modalId = useId();
  const titleId = useId();
  const highContrastId = useId();
  const reducedMotionId = useId();
  const largeTextId = useId();
  const screenReaderId = useId();

  useEffect(() => {
    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem("accessibility-preferences");
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.warn("Failed to parse accessibility preferences:", error);
      }
    }

    // Auto-detect system preferences
    setPreferences((prev) => ({
      ...prev,
      reducedMotion: MotionPreferences.prefersReducedMotion(),
    }));
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Focus management
    const modal = document.getElementById(modalId);
    if (modal) {
      const firstFocusable = modal.querySelector(
        "button, input"
      ) as HTMLElement;
      firstFocusable?.focus();
    }

    // Escape key handler
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, modalId, onClose]);

  const savePreferences = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem(
      "accessibility-preferences",
      JSON.stringify(newPreferences)
    );
    applyPreferences(newPreferences);

    // Announce change to screen readers
    ScreenReader.announcePolite("Accessibility preferences updated");
  };

  const applyPreferences = (prefs: UserPreferences) => {
    const root = document.documentElement;

    // Apply high contrast
    root.classList.toggle("high-contrast", prefs.highContrast);

    // Apply large text
    root.classList.toggle("large-text", prefs.largeText);

    // Apply screen reader optimized
    root.classList.toggle(
      "screen-reader-optimized",
      prefs.screenReaderOptimized
    );

    // Apply reduced motion (CSS will handle this via media query)
    if (prefs.reducedMotion) {
      root.style.setProperty("--animation-duration", "0ms");
      root.style.setProperty("--transition-duration", "0ms");
    } else {
      root.style.removeProperty("--animation-duration");
      root.style.removeProperty("--transition-duration");
    }
  };

  const handlePreferenceChange = (
    key: keyof UserPreferences,
    value: boolean
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    savePreferences(newPreferences);
  };

  const resetToDefaults = () => {
    const defaultPreferences: UserPreferences = {
      highContrast: false,
      reducedMotion: MotionPreferences.prefersReducedMotion(),
      largeText: false,
      screenReaderOptimized: false,
    };
    savePreferences(defaultPreferences);
    ScreenReader.announceAssertive(
      "Accessibility preferences reset to defaults"
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        id={modalId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-white rounded-xl shadow-card-lg max-w-md w-full flex flex-col focus-trap accessibility-modal">
          {/* Header */}
          <header className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 id={titleId} className="text-lg font-semibold text-gray-900">
                Accessibility Preferences
              </h2>
              <button
                onClick={onClose}
                className="btn btn-ghost p-2 rounded-full"
                aria-label="Close accessibility preferences"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Customize the interface to meet your accessibility needs.
            </p>
          </header>

          {/* Content */}
          <main className="flex-1 px-6 py-4 accessibility-modal-content">
            <fieldset className="space-y-3">
              <legend className="sr-only">Accessibility preferences</legend>

              {/* High Contrast */}
              <div className="flex items-start space-x-3">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id={highContrastId}
                    type="checkbox"
                    checked={preferences.highContrast}
                    onChange={(e) => handlePreferenceChange('highContrast', e.target.checked)}
                    className="h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                    aria-describedby={`${highContrastId}-description`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor={highContrastId} className="block text-sm font-medium text-gray-900">
                    High Contrast Mode
                  </label>
                  <p id={`${highContrastId}-description`} className="text-xs text-gray-600 mt-0.5">
                    Increase color contrast for better readability
                  </p>
                </div>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-start space-x-3">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id={reducedMotionId}
                    type="checkbox"
                    checked={preferences.reducedMotion}
                    onChange={(e) => handlePreferenceChange('reducedMotion', e.target.checked)}
                    className="h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                    aria-describedby={`${reducedMotionId}-description`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor={reducedMotionId} className="block text-sm font-medium text-gray-900">
                    Reduced Motion
                  </label>
                  <p id={`${reducedMotionId}-description`} className="text-xs text-gray-600 mt-0.5">
                    Minimize animations and transitions
                  </p>
                </div>
              </div>

              {/* Large Text */}
              <div className="flex items-start space-x-3">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id={largeTextId}
                    type="checkbox"
                    checked={preferences.largeText}
                    onChange={(e) => handlePreferenceChange('largeText', e.target.checked)}
                    className="h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                    aria-describedby={`${largeTextId}-description`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor={largeTextId} className="block text-sm font-medium text-gray-900">
                    Large Text
                  </label>
                  <p id={`${largeTextId}-description`} className="text-xs text-gray-600 mt-0.5">
                    Increase text size throughout the application
                  </p>
                </div>
              </div>

              {/* Screen Reader Optimized */}
              <div className="flex items-start space-x-3">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id={screenReaderId}
                    type="checkbox"
                    checked={preferences.screenReaderOptimized}
                    onChange={(e) => handlePreferenceChange('screenReaderOptimized', e.target.checked)}
                    className="h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                    aria-describedby={`${screenReaderId}-description`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor={screenReaderId} className="block text-sm font-medium text-gray-900">
                    Screen Reader Optimized
                  </label>
                  <p id={`${screenReaderId}-description`} className="text-xs text-gray-600 mt-0.5">
                    Enhance interface for screen reader users
                  </p>
                </div>
              </div>
            </fieldset>
          </main>

          {/* Footer */}
          <footer className="flex-shrink-0 px-6 py-3 bg-gray-50 rounded-b-xl">
            <div className="flex gap-3">
              <button
                onClick={resetToDefaults}
                className="btn btn-secondary flex-1 text-sm"
                type="button"
              >
                Reset to Defaults
              </button>
              <button
                onClick={onClose}
                className="btn btn-primary flex-1 text-sm"
                type="button"
              >
                Done
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

// CSS for accessibility preferences (add to index.css)
export const AccessibilityCSS = `
/* High contrast mode */
.high-contrast {
  --text-primary: #000000;
  --text-secondary: #000000;
  --bg-primary: #ffffff;
  --bg-secondary: #ffffff;
  --border-color: #000000;
}

.high-contrast .btn-primary {
  background-color: #000000;
  color: #ffffff;
  border: 2px solid #000000;
}

.high-contrast .btn-secondary {
  background-color: #ffffff;
  color: #000000;
  border: 2px solid #000000;
}

.high-contrast .card {
  border: 2px solid #000000;
  background-color: #ffffff;
}

.high-contrast .input {
  border: 2px solid #000000;
  background-color: #ffffff;
  color: #000000;
}

/* Large text mode */
.large-text {
  font-size: 18px;
}

.large-text .text-sm {
  font-size: 16px;
}

.large-text .text-xs {
  font-size: 14px;
}

.large-text .text-lg {
  font-size: 22px;
}

.large-text .text-xl {
  font-size: 26px;
}

.large-text .text-2xl {
  font-size: 32px;
}

/* Screen reader optimized */
.screen-reader-optimized .sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

.screen-reader-optimized [aria-hidden="true"] {
  display: none;
}
`;
