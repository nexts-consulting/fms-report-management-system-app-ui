import { IFormDefinition } from "@/types/model";
import { createStore } from "zustand";
import { devtools } from "zustand/middleware";

export type FormDefinitionStore = {
  // Cache form definitions by ID
  formDefinitions: Record<string, IFormDefinition | null>;
  // Loading states by form ID
  loadingStates: Record<string, boolean>;
  // Error states by form ID
  errorStates: Record<string, Error | null>;
  // Actions
  actions: {
    setFormDefinition: (formId: string, data: IFormDefinition | null) => void;
    setLoading: (formId: string, loading: boolean) => void;
    setError: (formId: string, error: Error | null) => void;
    clearFormDefinition: (formId: string) => void;
    clearAll: () => void;
  };
};

// Helper functions for localStorage
const getLocalStorageKey = (formId: string) => `form-definition-${formId}`;
const getCacheTimestampKey = (formId: string) => `form-definition-timestamp-${formId}`;

// Cache duration: 1 hour (3600000 ms)
const CACHE_DURATION = 60 * 60 * 1000;

export const getCachedFormDefinition = (formId: string): IFormDefinition | null => {
  if (typeof window === "undefined") return null;
  
  try {
    const cached = localStorage.getItem(getLocalStorageKey(formId));
    const timestamp = localStorage.getItem(getCacheTimestampKey(formId));
    
    if (cached && timestamp) {
      const cacheTime = parseInt(timestamp, 10);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - cacheTime < CACHE_DURATION) {
        return JSON.parse(cached) as IFormDefinition;
      } else {
        // Cache expired, remove it
        localStorage.removeItem(getLocalStorageKey(formId));
        localStorage.removeItem(getCacheTimestampKey(formId));
      }
    }
  } catch (error) {
    console.error("Error reading cached form definition:", error);
  }
  
  return null;
};

export const setCachedFormDefinition = (formId: string, data: IFormDefinition | null) => {
  if (typeof window === "undefined") return;
  
  try {
    if (data) {
      localStorage.setItem(getLocalStorageKey(formId), JSON.stringify(data));
      localStorage.setItem(getCacheTimestampKey(formId), Date.now().toString());
    } else {
      localStorage.removeItem(getLocalStorageKey(formId));
      localStorage.removeItem(getCacheTimestampKey(formId));
    }
  } catch (error) {
    console.error("Error caching form definition:", error);
  }
};

export const createFormDefinitionStore = () => {
  return createStore<FormDefinitionStore>()(
    devtools(
      (set, get) => ({
        formDefinitions: {},
        loadingStates: {},
        errorStates: {},
        actions: {
          setFormDefinition: (formId: string, data: IFormDefinition | null) => {
            set((state) => ({
              formDefinitions: {
                ...state.formDefinitions,
                [formId]: data,
              },
            }));
            // Cache to localStorage
            setCachedFormDefinition(formId, data);
          },
          setLoading: (formId: string, loading: boolean) => {
            set((state) => ({
              loadingStates: {
                ...state.loadingStates,
                [formId]: loading,
              },
            }));
          },
          setError: (formId: string, error: Error | null) => {
            set((state) => ({
              errorStates: {
                ...state.errorStates,
                [formId]: error,
              },
            }));
          },
          clearFormDefinition: (formId: string) => {
            set((state) => {
              const newFormDefinitions = { ...state.formDefinitions };
              const newLoadingStates = { ...state.loadingStates };
              const newErrorStates = { ...state.errorStates };
              
              delete newFormDefinitions[formId];
              delete newLoadingStates[formId];
              delete newErrorStates[formId];
              
              return {
                formDefinitions: newFormDefinitions,
                loadingStates: newLoadingStates,
                errorStates: newErrorStates,
              };
            });
            // Clear from localStorage
            setCachedFormDefinition(formId, null);
          },
          clearAll: () => {
            set({
              formDefinitions: {},
              loadingStates: {},
              errorStates: {},
            });
            // Clear all cached form definitions from localStorage
            if (typeof window !== "undefined") {
              const keys = Object.keys(localStorage);
              keys.forEach((key) => {
                if (key.startsWith("form-definition-") && !key.includes("timestamp")) {
                  const formId = key.replace("form-definition-", "");
                  localStorage.removeItem(key);
                  localStorage.removeItem(getCacheTimestampKey(formId));
                }
              });
            }
          },
        },
      }),
      { name: "FormDefinitionStore" },
    ),
  );
};




