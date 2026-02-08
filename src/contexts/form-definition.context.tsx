"use client";

import {
  createFormDefinitionStore,
  FormDefinitionStore,
  getCachedFormDefinition,
} from "@/stores/form-definition.store";
import React from "react";
import { StoreApi } from "zustand";
import { LibraryUtil } from "../kits/utils/lib.util";
import { httpRequestFormDefinitionById } from "@/services/api/application/form-definition/get-by-id";

export interface IFormDefinitionContext extends StoreApi<FormDefinitionStore> {}
const FormDefinitionContext = React.createContext<IFormDefinitionContext | undefined>(
  undefined,
);

interface FormDefinitionContextProviderProps {
  children: React.ReactNode;
}

export const FormDefinitionContextProvider = (
  props: FormDefinitionContextProviderProps,
) => {
  const { children } = props;

  const storeRef = React.useRef<IFormDefinitionContext>();
  if (!storeRef.current) {
    storeRef.current = createFormDefinitionStore();
  }

  return (
    <FormDefinitionContext.Provider value={storeRef.current}>
      {children}
    </FormDefinitionContext.Provider>
  );
};

export const useFormDefinitionContext = () => {
  const context = React.useContext(FormDefinitionContext);

  if (!context) {
    throw new Error(
      "FormDefinitionContext must be used within a FormDefinitionContextProvider",
    );
  }

  return LibraryUtil.zustand.createSelectors(context);
};

/**
 * Hook to get the raw store (for accessing getState directly)
 */
export const useFormDefinitionStore = () => {
  const context = React.useContext(FormDefinitionContext);

  if (!context) {
    throw new Error(
      "FormDefinitionContext must be used within a FormDefinitionContextProvider",
    );
  }

  return context;
};

/**
 * Hook to load form definition with caching
 * Returns the form definition, loading state, error, and a refetch function
 */
export const useFormDefinition = (formId: string | undefined) => {
  const storeSelectors = useFormDefinitionContext();
  const rawStore = useFormDefinitionStore();
  const formDefinition = storeSelectors.use.formDefinitions();
  const loadingStates = storeSelectors.use.loadingStates();
  const errorStates = storeSelectors.use.errorStates();
  const { setFormDefinition, setLoading, setError } = storeSelectors.use.actions();

  const data = formId ? formDefinition[formId] ?? null : null;
  const isLoading = formId ? loadingStates[formId] ?? false : false;
  const error = formId ? errorStates[formId] ?? null : null;

  // Load form definition from cache or API
  const loadFormDefinition = React.useCallback(
    async (id: string) => {
      if (!id) return;

      // Get current state to check if already loading
      const currentState = rawStore.getState();
      if (currentState.loadingStates[id]) return;

      // Check cache first
      const cached = getCachedFormDefinition(id);
      if (cached) {
        setFormDefinition(id, cached);
        return;
      }

      // Load from API
      setLoading(id, true);
      setError(id, null);

      try {
        const response = await httpRequestFormDefinitionById({ id });
        setFormDefinition(id, response.data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to load form definition");
        setError(id, error);
        setFormDefinition(id, null);
      } finally {
        setLoading(id, false);
      }
    },
    [rawStore, setFormDefinition, setLoading, setError],
  );

  // Auto-load when formId changes
  React.useEffect(() => {
    if (formId) {
      const currentState = rawStore.getState();
      // If not in store and not loading, try to load from cache or API
      if (!currentState.formDefinitions[formId] && !currentState.loadingStates[formId]) {
        loadFormDefinition(formId);
      }
    }
  }, [formId, rawStore, loadFormDefinition]);

  return {
    data,
    isLoading,
    error,
    refetch: () => formId && loadFormDefinition(formId),
  };
};

