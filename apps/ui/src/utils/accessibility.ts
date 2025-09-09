/**
 * Accessibility utilities and constants for WCAG compliance
 */
import React from "react";

export const ACCESSIBILITY_CONSTANTS = {
  // Minimum touch target size (44px x 44px per WCAG)
  MIN_TOUCH_TARGET: 44,

  // ARIA live region politeness levels
  LIVE_REGIONS: {
    POLITE: "polite",
    ASSERTIVE: "assertive",
    OFF: "off",
  } as const,

  // Common ARIA roles
  ROLES: {
    MAIN: "main",
    BANNER: "banner",
    NAVIGATION: "navigation",
    COMPLEMENTARY: "complementary",
    CONTENTINFO: "contentinfo",
    REGION: "region",
    ARTICLE: "article",
    BUTTON: "button",
    DIALOG: "dialog",
    ALERT: "alert",
    STATUS: "status",
    PROGRESSBAR: "progressbar",
    TAB: "tab",
    TABPANEL: "tabpanel",
    TABLIST: "tablist",
  } as const,

  // Keyboard navigation keys
  KEYS: {
    ENTER: "Enter",
    SPACE: " ",
    ESCAPE: "Escape",
    TAB: "Tab",
    ARROW_UP: "ArrowUp",
    ARROW_DOWN: "ArrowDown",
    ARROW_LEFT: "ArrowLeft",
    ARROW_RIGHT: "ArrowRight",
    HOME: "Home",
    END: "End",
  } as const,
};

/**
 * Creates screen reader only text
 */
export function createSROnlyText(text: string): string {
  return text;
}

/**
 * Announces text to screen readers using a live region
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
): void {
  // Create a temporary live region for announcements
  const liveRegion = document.createElement("div");
  liveRegion.setAttribute("aria-live", priority);
  liveRegion.setAttribute("aria-atomic", "true");
  liveRegion.classList.add("sr-only");
  liveRegion.textContent = message;

  document.body.appendChild(liveRegion);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(liveRegion);
  }, 1000);
}

/**
 * Manages focus for keyboard navigation
 */
export class FocusManager {
  private static instance: FocusManager;
  private focusableSelectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
    "[contenteditable]",
  ].join(", ");

  static getInstance(): FocusManager {
    if (!FocusManager.instance) {
      FocusManager.instance = new FocusManager();
    }
    return FocusManager.instance;
  }

  /**
   * Gets all focusable elements within a container
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors));
  }

  /**
   * Traps focus within a container (useful for modals)
   */
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== ACCESSIBILITY_CONSTANTS.KEYS.TAB) return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);

    // Focus first element
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  }

  /**
   * Moves focus to an element and scrolls it into view
   */
  focusElement(element: HTMLElement): void {
    element.focus();
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /**
   * Sets focus to the first focusable element in a container
   */
  focusFirst(container: HTMLElement): boolean {
    const firstFocusable = this.getFocusableElements(container)[0];
    if (firstFocusable) {
      this.focusElement(firstFocusable);
      return true;
    }
    return false;
  }
}

/**
 * Checks if an element is visible to screen readers
 */
export function isVisibleToScreenReaders(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return !(
    style.display === "none" ||
    style.visibility === "hidden" ||
    element.getAttribute("aria-hidden") === "true" ||
    element.hasAttribute("hidden")
  );
}

/**
 * Generates unique IDs for accessibility attributes
 */
export function generateAccessibilityId(prefix: string = "a11y"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates accessible button props with proper ARIA attributes
 */
export function createAccessibleButtonProps(
  label: string,
  description?: string,
  pressed?: boolean
): {
  "aria-label": string;
  "aria-describedby"?: string;
  "aria-pressed"?: boolean;
  role: string;
} {
  const props: any = {
    "aria-label": label,
    role: ACCESSIBILITY_CONSTANTS.ROLES.BUTTON,
  };

  if (description) {
    const descriptionId = generateAccessibilityId("desc");
    props["aria-describedby"] = descriptionId;
  }

  if (typeof pressed === "boolean") {
    props["aria-pressed"] = pressed;
  }

  return props;
}

/**
 * File type to human-readable format for screen readers
 */
export function getAccessibleFileType(fileType: string): string {
  const fileTypeMap: Record<string, string> = {
    image: "Image file",
    video: "Video file",
    document: "Document file",
    audio: "Audio file",
    other: "File",
  };

  return fileTypeMap[fileType] || "File";
}

/**
 * Formats file size for screen readers
 */
export function getAccessibleFileSize(bytes: number): string {
  if (bytes === 0) return "0 bytes";

  const units = ["bytes", "kilobytes", "megabytes", "gigabytes"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  const unit = units[i] || "bytes";

  return `${size} ${unit}`;
}

/**
 * Creates accessible error message props
 */
export function createAccessibleErrorProps(
  errorId: string,
  error?: string
): {
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
} {
  if (!error) return {};

  return {
    "aria-invalid": true,
    "aria-describedby": errorId,
  };
}

/**
 * Keyboard event handler helper for React events
 */
export function handleKeyboardActivation(
  e: React.KeyboardEvent | KeyboardEvent,
  callback: () => void,
  keys: string[] = [
    ACCESSIBILITY_CONSTANTS.KEYS.ENTER,
    ACCESSIBILITY_CONSTANTS.KEYS.SPACE,
  ]
): void {
  if (keys.includes(e.key)) {
    e.preventDefault();
    callback();
  }
}

/**
 * React-specific keyboard event handler helper
 */
export function handleReactKeyboardActivation<T = Element>(
  e: React.KeyboardEvent<T>,
  callback: () => void,
  keys: string[] = [
    ACCESSIBILITY_CONSTANTS.KEYS.ENTER,
    ACCESSIBILITY_CONSTANTS.KEYS.SPACE,
  ]
): void {
  if (keys.includes(e.key)) {
    e.preventDefault();
    callback();
  }
}

/**
 * WCAG 2.2 Color contrast utilities
 */
export const ColorContrast = {
  /**
   * Calculate relative luminance of a color
   */
  getLuminance(hex: string): number {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 0;

    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Convert hex color to RGB
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getLuminance(color1);
    const lum2 = this.getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if contrast meets WCAG AA requirements
   */
  meetsWCAGAA(foreground: string, background: string, isLargeText = false): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
  },

  /**
   * Check if contrast meets WCAG AAA requirements
   */
  meetsWCAGAAA(foreground: string, background: string, isLargeText = false): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 4.5 : ratio >= 7.0;
  },
};

/**
 * Motion and animation preferences (WCAG 2.2)
 */
export const MotionPreferences = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },

  /**
   * Safely animate with respect to motion preferences
   */
  safeAnimate(element: HTMLElement, animation: Keyframe[] | PropertyIndexedKeyframes, options?: KeyframeAnimationOptions) {
    if (this.prefersReducedMotion()) {
      // Skip animation for users who prefer reduced motion
      return element.animate([], { duration: 0 });
    }
    return element.animate(animation, options);
  },

  /**
   * Get safe animation duration based on motion preferences
   */
  getSafeDuration(normalDuration: number): number {
    return this.prefersReducedMotion() ? 0 : normalDuration;
  },
};

/**
 * Target size utilities (WCAG 2.2 - 2.5.8 Target Size)
 */
export const TargetSize = {
  /**
   * Minimum target size in pixels (44x44 for Level AA)
   */
  MINIMUM_SIZE: 44,

  /**
   * Check if an element meets minimum target size requirements
   */
  meetsMinimumSize(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return rect.width >= this.MINIMUM_SIZE && rect.height >= this.MINIMUM_SIZE;
  },

  /**
   * Get touch-friendly size classes for Tailwind
   */
  getTouchFriendlyClasses(): string {
    return "min-h-[44px] min-w-[44px] touch-target";
  },
};

/**
 * Enhanced Focus Management for WCAG 2.4.3 Focus Order
 */
export class EnhancedFocusManager extends FocusManager {
  private focusHistory: HTMLElement[] = [];
  private maxHistoryLength = 10;

  /**
   * Track focus history for better focus management
   */
  trackFocus(element: HTMLElement): void {
    this.focusHistory.push(element);
    if (this.focusHistory.length > this.maxHistoryLength) {
      this.focusHistory.shift();
    }
  }

  /**
   * Return focus to previous element
   */
  returnToPreviousFocus(): boolean {
    const previousElement = this.focusHistory[this.focusHistory.length - 2];
    if (previousElement && document.contains(previousElement)) {
      this.focusElement(previousElement);
      return true;
    }
    return false;
  }

  /**
   * Focus element with enhanced error handling and validation
   */
  focusElement(element: HTMLElement): void {
    if (!element || !document.contains(element)) {
      console.warn("Attempted to focus non-existent or detached element");
      return;
    }

    // Check if element is focusable
    const focusableElements = this.getFocusableElements(document.body);
    if (!focusableElements.includes(element)) {
      console.warn("Attempted to focus non-focusable element");
      return;
    }

    this.trackFocus(element);
    element.focus({ preventScroll: false });
    element.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /**
   * Enhanced focus trap with better keyboard navigation
   */
  trapFocus(container: HTMLElement, options: {
    initialFocus?: HTMLElement;
    returnFocus?: HTMLElement;
  } = {}): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ACCESSIBILITY_CONSTANTS.KEYS.TAB) {
        if (focusableElements.length === 1) {
          e.preventDefault();
          return;
        }

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      } else if (e.key === ACCESSIBILITY_CONSTANTS.KEYS.ESCAPE) {
        if (options.returnFocus && document.contains(options.returnFocus)) {
          this.focusElement(options.returnFocus);
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    // Set initial focus
    const initialFocusElement = options.initialFocus || firstElement;
    if (initialFocusElement) {
      this.focusElement(initialFocusElement);
    }

    // Return cleanup function
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      if (options.returnFocus && document.contains(options.returnFocus)) {
        this.focusElement(options.returnFocus);
      }
    };
  }
}

/**
 * WCAG 2.2 Input Modalities utilities (2.5.1, 2.5.2, 2.5.3, 2.5.4)
 */
export const InputModalities = {
  /**
   * Check if device has pointer input (mouse, trackpad)
   */
  hasPointerInput(): boolean {
    return window.matchMedia("(pointer: fine)").matches;
  },

  /**
   * Check if device has touch input
   */
  hasTouchInput(): boolean {
    return window.matchMedia("(pointer: coarse)").matches;
  },

  /**
   * Create pointer-event-aware handler
   */
  createPointerHandler(callback: () => void) {
    return {
      onClick: callback,
      onPointerDown: (e: PointerEvent) => {
        // Only trigger for primary pointer (left mouse, first touch)
        if (e.isPrimary) {
          e.preventDefault();
          callback();
        }
      },
    };
  },
};

/**
 * Language and text direction utilities
 */
export const TextDirection = {
  /**
   * Get document text direction
   */
  getDirection(): "ltr" | "rtl" {
    return document.documentElement.dir as "ltr" | "rtl" || "ltr";
  },

  /**
   * Check if document is right-to-left
   */
  isRTL(): boolean {
    return this.getDirection() === "rtl";
  },

  /**
   * Get appropriate arrow keys for navigation based on text direction
   */
  getNavigationKeys(): {
    next: string;
    previous: string;
    up: string;
    down: string;
  } {
    const isRTL = this.isRTL();
    return {
      next: isRTL ? ACCESSIBILITY_CONSTANTS.KEYS.ARROW_LEFT : ACCESSIBILITY_CONSTANTS.KEYS.ARROW_RIGHT,
      previous: isRTL ? ACCESSIBILITY_CONSTANTS.KEYS.ARROW_RIGHT : ACCESSIBILITY_CONSTANTS.KEYS.ARROW_LEFT,
      up: ACCESSIBILITY_CONSTANTS.KEYS.ARROW_UP,
      down: ACCESSIBILITY_CONSTANTS.KEYS.ARROW_DOWN,
    };
  },
};

/**
 * Comprehensive screen reader utilities
 */
export const ScreenReader = {
  /**
   * Create a polite announcement
   */
  announcePolite(message: string): void {
    announceToScreenReader(message, "polite");
  },

  /**
   * Create an assertive announcement (interrupts current speech)
   */
  announceAssertive(message: string): void {
    announceToScreenReader(message, "assertive");
  },

  /**
   * Create status update for screen readers
   */
  announceStatus(message: string): void {
    const statusRegion = document.getElementById("live-region");
    if (statusRegion) {
      statusRegion.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        statusRegion.textContent = "";
      }, 1000);
    }
  },

  /**
   * Create descriptive text for complex UI elements
   */
  createDescription(element: {
    type: string;
    name: string;
    state?: string;
    help?: string;
  }): string {
    let description = `${element.name}, ${element.type}`;
    if (element.state) {
      description += `, ${element.state}`;
    }
    if (element.help) {
      description += `. ${element.help}`;
    }
    return description;
  },
};

/**
 * Form accessibility utilities
 */
export const FormAccessibility = {
  /**
   * Create comprehensive form field accessibility props
   */
  createFieldProps(
    id: string,
    label: string,
    options: {
      required?: boolean;
      error?: string;
      description?: string;
      invalid?: boolean;
    } = {}
  ) {
    const props: any = {
      id,
      "aria-label": label,
    };

    if (options.required) {
      props["aria-required"] = true;
      props.required = true;
    }

    if (options.error || options.invalid) {
      props["aria-invalid"] = true;
      props["aria-describedby"] = `${id}-error`;
    }

    if (options.description && !options.error) {
      props["aria-describedby"] = `${id}-description`;
    }

    if (options.description && options.error) {
      props["aria-describedby"] = `${id}-description ${id}-error`;
    }

    return props;
  },

  /**
   * Validate form accessibility
   */
  validateFormAccessibility(form: HTMLFormElement): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    const inputs = form.querySelectorAll("input, select, textarea");

    inputs.forEach((input) => {
      const element = input as HTMLInputElement;
      
      // Check for labels
      const label = form.querySelector(`label[for="${element.id}"]`);
      const ariaLabel = element.getAttribute("aria-label");
      const ariaLabelledby = element.getAttribute("aria-labelledby");
      
      if (!label && !ariaLabel && !ariaLabelledby) {
        issues.push(`Input ${element.id || element.name || 'unnamed'} lacks accessible label`);
      }
      
      // Check required fields
      if (element.required && !element.getAttribute("aria-required")) {
        issues.push(`Required input ${element.id || element.name || 'unnamed'} missing aria-required`);
      }
      
      // Check error states
      if (element.getAttribute("aria-invalid") === "true") {
        const errorId = element.getAttribute("aria-describedby");
        if (!errorId || !form.querySelector(`#${errorId}`)) {
          issues.push(`Invalid input ${element.id || element.name || 'unnamed'} missing error description`);
        }
      }
    });

    return {
      isValid: issues.length === 0,
      issues,
    };
  },
};

/**
 * Initialize axe-core for development (should be called in development only)
 */
export async function initializeAxeCore(): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    try {
      const { default: axe } = await import("@axe-core/react");
      const React = await import("react");
      const ReactDOM = await import("react-dom");
      
      axe(React, ReactDOM, 1000);
      console.log("axe-core initialized for accessibility testing");
    } catch (error) {
      console.warn("Failed to initialize axe-core:", error);
    }
  }
}
