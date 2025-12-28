import { IReportDefinition } from "@/types/model";
import { createStore } from "zustand";
import { devtools } from "zustand/middleware";

export type ReportDefinitionStore = {
  // Cache report definitions by ID
  reportDefinitions: Record<string, IReportDefinition | null>;
  // Loading states by report ID
  loadingStates: Record<string, boolean>;
  // Error states by report ID
  errorStates: Record<string, Error | null>;
  // Actions
  actions: {
    setReportDefinition: (reportId: string, data: IReportDefinition | null) => void;
    setLoading: (reportId: string, loading: boolean) => void;
    setError: (reportId: string, error: Error | null) => void;
    clearReportDefinition: (reportId: string) => void;
    clearAll: () => void;
  };
};

// Helper functions for localStorage
const getLocalStorageKey = (reportId: string) => `report-definition-${reportId}`;
const getCacheTimestampKey = (reportId: string) => `report-definition-timestamp-${reportId}`;

// Cache duration: 1 hour (3600000 ms)
const CACHE_DURATION = 60 * 60 * 1000;

export const getCachedReportDefinition = (reportId: string): IReportDefinition | null => {
  if (typeof window === "undefined") return null;
  
  try {
    const cached = localStorage.getItem(getLocalStorageKey(reportId));
    const timestamp = localStorage.getItem(getCacheTimestampKey(reportId));
    
    if (cached && timestamp) {
      const cacheTime = parseInt(timestamp, 10);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - cacheTime < CACHE_DURATION) {
        return JSON.parse(cached) as IReportDefinition;
      } else {
        // Cache expired, remove it
        localStorage.removeItem(getLocalStorageKey(reportId));
        localStorage.removeItem(getCacheTimestampKey(reportId));
      }
    }
  } catch (error) {
    console.error("Error reading cached report definition:", error);
  }
  
  return null;
};

export const setCachedReportDefinition = (reportId: string, data: IReportDefinition | null) => {
  if (typeof window === "undefined") return;
  
  try {
    if (data) {
      localStorage.setItem(getLocalStorageKey(reportId), JSON.stringify(data));
      localStorage.setItem(getCacheTimestampKey(reportId), Date.now().toString());
    } else {
      localStorage.removeItem(getLocalStorageKey(reportId));
      localStorage.removeItem(getCacheTimestampKey(reportId));
    }
  } catch (error) {
    console.error("Error caching report definition:", error);
  }
};

export const createReportDefinitionStore = () => {
  return createStore<ReportDefinitionStore>()(
    devtools(
      (set, get) => ({
        reportDefinitions: {},
        loadingStates: {},
        errorStates: {},
        actions: {
          setReportDefinition: (reportId: string, data: IReportDefinition | null) => {
            set((state) => ({
              reportDefinitions: {
                ...state.reportDefinitions,
                [reportId]: data,
              },
            }));
            // Cache to localStorage
            setCachedReportDefinition(reportId, data);
          },
          setLoading: (reportId: string, loading: boolean) => {
            set((state) => ({
              loadingStates: {
                ...state.loadingStates,
                [reportId]: loading,
              },
            }));
          },
          setError: (reportId: string, error: Error | null) => {
            set((state) => ({
              errorStates: {
                ...state.errorStates,
                [reportId]: error,
              },
            }));
          },
          clearReportDefinition: (reportId: string) => {
            set((state) => {
              const newReportDefinitions = { ...state.reportDefinitions };
              const newLoadingStates = { ...state.loadingStates };
              const newErrorStates = { ...state.errorStates };
              
              delete newReportDefinitions[reportId];
              delete newLoadingStates[reportId];
              delete newErrorStates[reportId];
              
              return {
                reportDefinitions: newReportDefinitions,
                loadingStates: newLoadingStates,
                errorStates: newErrorStates,
              };
            });
            // Clear from localStorage
            setCachedReportDefinition(reportId, null);
          },
          clearAll: () => {
            set({
              reportDefinitions: {},
              loadingStates: {},
              errorStates: {},
            });
            // Clear all cached report definitions from localStorage
            if (typeof window !== "undefined") {
              const keys = Object.keys(localStorage);
              keys.forEach((key) => {
                if (key.startsWith("report-definition-") && !key.includes("timestamp")) {
                  const reportId = key.replace("report-definition-", "");
                  localStorage.removeItem(key);
                  localStorage.removeItem(getCacheTimestampKey(reportId));
                }
              });
            }
          },
        },
      }),
      { name: "ReportDefinitionStore" },
    ),
  );
};

