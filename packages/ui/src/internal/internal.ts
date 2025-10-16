/**
 * Internal utilities for the Zana UI system
 * 
 * Private utilities used internally by components.
 * Not part of the public API.
 */

import { clsx, type ClassValue } from 'clsx';

/**
 * Utility for merging class names with clsx
 * Provides a consistent way to combine conditional classes
 */
export function cx(...classes: ClassValue[]): string {
  return clsx(classes);
}

/**
 * Generate stable, deterministic IDs for components
 * Useful for accessibility attributes and DOM anchoring
 */
let idCounter = 0;

export function generateId(prefix = 'zana'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Utility to create stable data attributes for analytics and tours
 */
export function createDataAttributes(
  identifier: string,
  additionalAttributes?: Record<string, string | number | boolean>
): Record<string, string> {
  const baseAttributes: Record<string, string> = {
    'data-analytics-id': identifier,
    'data-tour': identifier,
  };

  if (additionalAttributes) {
    Object.entries(additionalAttributes).forEach(([key, value]) => {
      baseAttributes[`data-${key}`] = String(value);
    });
  }

  return baseAttributes;
}

/**
 * Type-safe way to omit properties from an object
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
}

/**
 * Type-safe way to pick properties from an object
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Debounce utility for event handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle utility for event handlers
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if code is running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Check if element is visible in viewport
 */
export function isElementVisible(element: Element): boolean {
  if (!isBrowser()) return false;

  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Focus management utilities for accessibility
 */
export const focusUtils = {
  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container: Element): Element[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors));
  },

  /**
   * Trap focus within a container (useful for modals)
   */
  trapFocus(container: Element): () => void {
    const focusableElements = focusUtils.getFocusableElements(container);
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    // Focus first element initially
    firstElement?.focus();

    // Return cleanup function
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  },
};

/**
 * Keyboard utilities for accessibility
 */
export const keyboardUtils = {
  /**
   * Check if key is an arrow key
   */
  isArrowKey(key: string): boolean {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key);
  },

  /**
   * Check if key should activate an element (Enter or Space)
   */
  isActivationKey(key: string): boolean {
    return key === 'Enter' || key === ' ';
  },

  /**
   * Check if key is Escape
   */
  isEscapeKey(key: string): boolean {
    return key === 'Escape';
  },
};

/**
 * Animation utilities
 */
export const animationUtils = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion(): boolean {
    if (!isBrowser()) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Get animation duration based on user preference
   */
  getAnimationDuration(normalDuration: number): number {
    return animationUtils.prefersReducedMotion() ? 0 : normalDuration;
  },
};