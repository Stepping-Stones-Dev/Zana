/**
 * Internationalization utilities for the Zana UI system
 * 
 * Provides lightweight i18n support for UI components.
 * Note: This package only provides reference keys and structure.
 * Actual translations (NLS) are owned by consuming applications.
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Types for i18n system
export type Language = string;
export type TranslationKey = string;
export type TranslationValue = string | number;
export type Translations = Record<TranslationKey, TranslationValue>;
export type Dictionary = Record<Language, Translations>;

// Interpolation pattern for variable substitution
const INTERPOLATION_PATTERN = /\{([^}]+)\}/g;

// I18n context type
export interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, variables?: Record<string, TranslationValue>) => string;
  has: (key: TranslationKey) => boolean;
  availableLanguages: Language[];
}

// Default context value
const defaultContextValue: I18nContextValue = {
  language: 'en',
  setLanguage: () => {},
  t: (key: TranslationKey) => key,
  has: () => false,
  availableLanguages: ['en'],
};

// Create context
const I18nContext = createContext<I18nContextValue>(defaultContextValue);

// Provider props
export interface I18nProviderProps {
  children: ReactNode;
  dictionary?: Dictionary;
  initialLanguage?: Language;
  fallbackLanguage?: Language;
  storageKey?: string;
  onLanguageChange?: (language: Language) => void;
}

/**
 * I18n Provider component
 * 
 * Note: Dictionary is optional as translations are owned by consuming apps.
 * This provider manages language state and provides translation utilities.
 */
export function I18nProvider({
  children,
  dictionary = {},
  initialLanguage,
  fallbackLanguage = 'en',
  storageKey = 'zana-ui-language',
  onLanguageChange,
}: I18nProviderProps) {
  // Determine initial language
  const getInitialLanguage = (): Language => {
    if (initialLanguage) {
      return initialLanguage;
    }
    
    // Try to get from storage
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && Object.keys(dictionary).includes(stored)) {
        return stored;
      }
    } catch (error) {
      // Handle localStorage not available
    }
    
    return fallbackLanguage;
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  
  // Available languages from dictionary
  const availableLanguages = Object.keys(dictionary);
  if (availableLanguages.length === 0) {
    availableLanguages.push(fallbackLanguage);
  }

  // Language setter with persistence
  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage);
    
    // Persist to storage
    try {
      localStorage.setItem(storageKey, newLanguage);
    } catch (error) {
      // Handle localStorage not available
      console.warn('Failed to store language preference:', error);
    }
    
    // Call change handler
    onLanguageChange?.(newLanguage);
  }, [storageKey, onLanguageChange]);

  // Translation function
  const t = useCallback((
    key: TranslationKey, 
    variables?: Record<string, TranslationValue>
  ): string => {
    // Get translation from current language
    const currentTranslations = dictionary[language];
    let translation = currentTranslations?.[key];
    
    // Fallback to fallback language
    if (translation === undefined) {
      const fallbackTranslations = dictionary[fallbackLanguage];
      translation = fallbackTranslations?.[key];
    }
    
    // Final fallback to key itself (useful for development)
    if (translation === undefined) {
      translation = key;
    }
    
    // Convert to string
    let result = String(translation);
    
    // Apply variable interpolation
    if (variables && typeof result === 'string') {
      result = result.replace(INTERPOLATION_PATTERN, (match, variableName) => {
        const value = variables[variableName];
        return value !== undefined ? String(value) : match;
      });
    }
    
    return result;
  }, [language, dictionary, fallbackLanguage]);

  // Check if translation exists
  const has = useCallback((key: TranslationKey): boolean => {
    const currentTranslations = dictionary[language];
    if (currentTranslations?.[key] !== undefined) {
      return true;
    }
    
    const fallbackTranslations = dictionary[fallbackLanguage];
    return fallbackTranslations?.[key] !== undefined;
  }, [language, dictionary, fallbackLanguage]);

  const contextValue: I18nContextValue = {
    language,
    setLanguage,
    t,
    has,
    availableLanguages,
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook to access full i18n context
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

/**
 * Hook to access only the translation function (most common use case)
 */
export function useTranslate(): I18nContextValue['t'] {
  const { t } = useI18n();
  return t;
}

/**
 * Hook to access only language state and setter
 */
export function useLanguage(): {
  language: Language;
  setLanguage: (lang: Language) => void;
  availableLanguages: Language[];
} {
  const { language, setLanguage, availableLanguages } = useI18n();
  return { language, setLanguage, availableLanguages };
}

/**
 * Utility to create type-safe i18n configuration
 * Helps consuming applications structure their translations
 */
export function createI18nConfig<T extends Record<string, any>>(
  namespace: string,
  languages: Language[],
  translationParts: Record<Language, T>
): {
  namespace: string;
  languages: Language[];
  dictionary: Dictionary;
} {
  const dictionary: Dictionary = {};
  
  // Build dictionary with namespaced keys
  for (const lang of languages) {
    dictionary[lang] = {};
    const parts = translationParts[lang];
    
    if (parts) {
      // Flatten and namespace the translation keys
      const flattenKeys = (obj: any, prefix = ''): Record<string, TranslationValue> => {
        const result: Record<string, TranslationValue> = {};
        
        for (const [key, value] of Object.entries(obj)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            Object.assign(result, flattenKeys(value, fullKey));
          } else {
            result[`${namespace}.${fullKey}`] = value as TranslationValue;
          }
        }
        
        return result;
      };
      
      dictionary[lang] = flattenKeys(parts);
    }
  }
  
  return {
    namespace,
    languages,
    dictionary,
  };
}

/**
 * UI component reference keys
 * These are the keys that UI components will use internally.
 * Consuming applications should provide translations for these keys.
 */
export const UI_REFERENCE_KEYS = {
  // Common actions
  'ui.action.save': 'ui.action.save',
  'ui.action.cancel': 'ui.action.cancel',
  'ui.action.delete': 'ui.action.delete',
  'ui.action.edit': 'ui.action.edit',
  'ui.action.close': 'ui.action.close',
  'ui.action.open': 'ui.action.open',
  'ui.action.expand': 'ui.action.expand',
  'ui.action.collapse': 'ui.action.collapse',
  
  // Navigation
  'ui.nav.menu': 'ui.nav.menu',
  'ui.nav.back': 'ui.nav.back',
  'ui.nav.next': 'ui.nav.next',
  'ui.nav.previous': 'ui.nav.previous',
  
  // States
  'ui.state.loading': 'ui.state.loading',
  'ui.state.error': 'ui.state.error',
  'ui.state.empty': 'ui.state.empty',
  'ui.state.success': 'ui.state.success',
  
  // Accessibility
  'ui.a11y.skipToContent': 'ui.a11y.skipToContent',
  'ui.a11y.toggleNavigation': 'ui.a11y.toggleNavigation',
  'ui.a11y.closeDialog': 'ui.a11y.closeDialog',
} as const;

export type UIReferenceKey = keyof typeof UI_REFERENCE_KEYS;