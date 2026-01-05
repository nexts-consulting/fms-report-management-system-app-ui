import { PromiseValue } from "@/types";
import { AxiosError } from "axios";
import {
  QueryClient,
  UseQueryOptions,
  UseMutationOptions,
  DefaultOptions,
  UseInfiniteQueryOptions,
} from "react-query";

/**
 * Check if error is an API error (AxiosError or Supabase/PostgREST error)
 * Supabase errors have structure: { code: string, message: string, details?: string, hint?: string }
 */
const isApiError = (error: unknown): error is AxiosError | { code?: string; message?: string } => {
  // Check for AxiosError
  if (error instanceof AxiosError) {
    return true;
  }
  
  // Check for Supabase/PostgREST error structure
  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;
    // Supabase/PostgREST errors typically have 'code' and 'message' properties
    // Code is usually a string (e.g., "42P01", "23505", "PGRST116", etc.)
    if (
      ("code" in err && typeof err.code === "string") ||
      ("message" in err && typeof err.message === "string")
    ) {
      return true;
    }
  }
  
  return false;
};

const queryConfig: DefaultOptions = {
  queries: {
    // Don't throw API errors to error boundary - they're handled by onError callbacks
    // Only throw non-API errors (like render errors) to error boundary
    useErrorBoundary: (error: unknown) => {
      // Don't throw API errors (AxiosError or Supabase/PostgREST errors) to error boundary
      // They should be handled by onError callbacks
      if (isApiError(error)) {
        return false; // Don't throw API errors to error boundary
      }
      // Only throw non-API errors (like render errors) to error boundary
      return true;
    },
    refetchOnWindowFocus: false,
    retry: false,
  },
  mutations: {
    // Don't throw API errors to error boundary - they're handled by onError callbacks
    // Only throw non-API errors (like render errors) to error boundary
    useErrorBoundary: (error: unknown) => {
      // Don't throw API errors (AxiosError or Supabase/PostgREST errors) to error boundary
      // They should be handled by onError callbacks
      if (isApiError(error)) {
        return false; // Don't throw API errors to error boundary
      }
      // Only throw non-API errors (like render errors) to error boundary
      return true;
    },
  },
};

export const queryClient = new QueryClient({ defaultOptions: queryConfig });

export type ExtractFnReturnType<FnType extends (...args: any) => any> = PromiseValue<
  ReturnType<FnType>
>;

export type QueryConfig<QueryFnType extends (...args: any) => any> = Omit<
  UseQueryOptions<ExtractFnReturnType<QueryFnType>>,
  "queryKey" | "queryFn"
>;

export type InfiniteQueryConfig<QueryFnType extends (...args: any) => any> = Omit<
  UseInfiniteQueryOptions<ExtractFnReturnType<QueryFnType>>,
  "queryKey" | "queryFn"
>;

export type MutationConfig<MutationFnType extends (...args: any) => any> = UseMutationOptions<
  ExtractFnReturnType<MutationFnType>,
  AxiosError,
  Parameters<MutationFnType>[0]
>;
