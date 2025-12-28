"use client";

import {
  createReportDefinitionStore,
  ReportDefinitionStore,
  getCachedReportDefinition,
} from "@/stores/report-definition.store";
import React from "react";
import { StoreApi } from "zustand";
import { LibraryUtil } from "../kits/utils/lib.util";
import { httpRequestReportDefinitionPreviewByCode } from "@/services/api/application/report-definition/get-preview-by-id";
import { IReportDefinition } from "@/types/model";

export interface IReportDefinitionContext extends StoreApi<ReportDefinitionStore> {}
const ReportDefinitionContext = React.createContext<IReportDefinitionContext | undefined>(
  undefined,
);

interface ReportDefinitionContextProviderProps {
  children: React.ReactNode;
}

export const ReportDefinitionContextProvider = (
  props: ReportDefinitionContextProviderProps,
) => {
  const { children } = props;

  const storeRef = React.useRef<IReportDefinitionContext>();
  if (!storeRef.current) {
    storeRef.current = createReportDefinitionStore();
  }

  return (
    <ReportDefinitionContext.Provider value={storeRef.current}>
      {children}
    </ReportDefinitionContext.Provider>
  );
};

export const useReportDefinitionContext = () => {
  const context = React.useContext(ReportDefinitionContext);

  if (!context) {
    throw new Error(
      "ReportDefinitionContext must be used within a ReportDefinitionContextProvider",
    );
  }

  return LibraryUtil.zustand.createSelectors(context);
};

/**
 * Hook to get the raw store (for accessing getState directly)
 */
export const useReportDefinitionStore = () => {
  const context = React.useContext(ReportDefinitionContext);

  if (!context) {
    throw new Error(
      "ReportDefinitionContext must be used within a ReportDefinitionContextProvider",
    );
  }

  return context;
};

/**
 * Hook to load report definition with caching
 * Returns the report definition, loading state, error, and a refetch function
 */
export const useReportDefinition = (reportId: string | undefined) => {
  const storeSelectors = useReportDefinitionContext();
  const rawStore = useReportDefinitionStore();
  const reportDefinition = storeSelectors.use.reportDefinitions();
  const loadingStates = storeSelectors.use.loadingStates();
  const errorStates = storeSelectors.use.errorStates();
  const { setReportDefinition, setLoading, setError } = storeSelectors.use.actions();

  const data = reportId ? reportDefinition[reportId] ?? null : null;
  const isLoading = reportId ? loadingStates[reportId] ?? false : false;
  const error = reportId ? errorStates[reportId] ?? null : null;

  // Load report definition from cache or API
  const loadReportDefinition = React.useCallback(
    async (id: string) => {
      if (!id) return;

      // Get current state to check if already loading
      const currentState = rawStore.getState();
      if (currentState.loadingStates[id]) return;

      // Check cache first
      const cached = getCachedReportDefinition(id);
      if (cached) {
        setReportDefinition(id, cached);
        return;
      }

      // Load from API
      setLoading(id, true);
      setError(id, null);

      try {
        const response = await httpRequestReportDefinitionPreviewByCode({ id });
        setReportDefinition(id, response.data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to load report definition");
        setError(id, error);
        setReportDefinition(id, null);
      } finally {
        setLoading(id, false);
      }
    },
    [rawStore, setReportDefinition, setLoading, setError],
  );

  // Auto-load when reportId changes
  React.useEffect(() => {
    if (reportId) {
      const currentState = rawStore.getState();
      // If not in store and not loading, try to load from cache or API
      if (!currentState.reportDefinitions[reportId] && !currentState.loadingStates[reportId]) {
        loadReportDefinition(reportId);
      }
    }
  }, [reportId, rawStore, loadReportDefinition]);

  return {
    data,
    isLoading,
    error,
    refetch: () => reportId && loadReportDefinition(reportId),
  };
};

