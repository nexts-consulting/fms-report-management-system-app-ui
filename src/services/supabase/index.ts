import { createClient, SupabaseClient } from "@supabase/supabase-js";
import moment from "moment";

type SupabaseRoute = string | undefined;

class SupabaseService {
  private static instances: Map<string, SupabaseService> = new Map();
  private _client: SupabaseClient;
  private initialized: boolean = false;
  private route: string;

  private constructor(route: SupabaseRoute = undefined) {
    this.route = route || "default";
    const routeLabel = this.route === "default" ? "" : ` (route: ${this.route})`;
    console.log(`🚀 Initializing Supabase Service${routeLabel}...`);
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!baseUrl) {
      console.error("❌ NEXT_PUBLIC_API_URL is not defined");
      throw new Error("NEXT_PUBLIC_API_URL environment variable is required");
    }

    // Build URL with route if provided
    const supabaseUrl = route 
      ? `${baseUrl.replace(/\/$/, "")}/${route.replace(/^\//, "")}`
      : baseUrl;

    // Because Gateway has handled apiKey and Authorization,
    // we can use a temporary anon key or leave it empty
    // Gateway will automatically add apiKey to header
    // Chọn anon key dựa trên route
    const supabaseMasterAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_MASTER || "";
    const supabaseFmsAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_FMS || "";
    const supabaseDefaultAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    
    // Chọn anon key phù hợp với route
    let supabaseAnonKey: string;
    if (this.route === "fms") {
      supabaseAnonKey = supabaseFmsAnonKey;
      if (supabaseFmsAnonKey) {
        console.log(`🔑 Using FMS anon key for route: ${this.route}`);
      } else {
        console.warn(`⚠️ FMS anon key not found for route: ${this.route}`);
      }
    } else if (this.route === "master-data") {
      supabaseAnonKey = supabaseMasterAnonKey;
      if (supabaseMasterAnonKey) {
        console.log(`🔑 Using Master anon key for route: ${this.route}`);
      } else {
        console.warn(`⚠️ Master anon key not found for route: ${this.route}`);
      }
    } else {
      // Default route - ưu tiên master key, nếu không có thì dùng default
      supabaseAnonKey = supabaseMasterAnonKey || supabaseDefaultAnonKey;
      if (supabaseAnonKey) {
        console.log(`🔑 Using default anon key for route: ${this.route}`);
      } else {
        console.warn(`⚠️ No anon key found for default route: ${this.route}`);
      }
    }

    try {
      // Fetch function to automatically add headers from localStorage
      const fetchFunction = (url: RequestInfo | URL, options: RequestInit = {}) => {
        // Get token and tenant code from localStorage
        let token: string | undefined;
        let tenantCode: string | undefined;

        if (typeof window !== "undefined") {
          try {
            const authStorage = localStorage.getItem("auth-storage");
            const authData = JSON.parse(authStorage || "{}");
            // Prioritize accessToken, fallback to token for backward compatibility
            token = authData.state?.accessToken || authData.state?.token;
            tenantCode = authData.state?.tenant?.code;
          } catch (error) {
            console.warn("⚠️ Failed to read auth storage:", error);
          }
        }

        // Merge headers - preserve existing headers from Supabase (especially for .single() queries)
        // Xử lý cả trường hợp options.headers là Headers instance hoặc object thông thường
        const existingHeaders = options.headers instanceof Headers 
          ? options.headers 
          : new Headers(options.headers || {});
        
        const headers = new Headers(existingHeaders);
        
        // Only set default Accept if not already set by Supabase
        // Supabase sets "application/vnd.pgrst.object+json" for .single() queries
        if (!headers.has("Accept")) {
          headers.set("Accept", "application/json");
        }
        
        // Always add timestamp header
        headers.set("x-request-timestamp", moment.utc().format("X"));

        if (token) {
          headers.set("x-apikey", `Bearer ${token}`);
        } else {
          console.warn(`No accessToken found, x-apikey header will not be set`);
        }

        if (tenantCode) {
          headers.set("x-tenant-code", tenantCode);
        }

        return fetch(url, {
          ...options,
          headers,
        });
      };

      // Create a storage key for each route to avoid conflicts between GoTrueClient instances
      const storageKey = `sb-${this.route}-auth-token`;

      // No-op storage adapter to completely disable storage (because Gateway has handled auth)
      const noOpStorage = {
        getItem: (_key: string) => null,
        setItem: (_key: string, _value: string) => {},
        removeItem: (_key: string) => {},
      };

      this._client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          // Disable auto refresh token because Gateway has handled authentication and token refresh
          autoRefreshToken: false,
          // Disable persist session because Gateway has handled
          persistSession: false,
          // Disable detect session in URL
          detectSessionInUrl: false,
          // Sử dụng storage key riêng cho mỗi route và no-op storage
          storage: noOpStorage,
          storageKey: storageKey,
        },
        global: {
          // Use custom fetch to automatically add headers
          fetch: fetchFunction,
          // Don't set default Accept header here - let Supabase set it based on query type
          // (e.g., "application/vnd.pgrst.object+json" for .single())
        },
      });

      this.initialized = true;
      console.log(`✅ Supabase Service${routeLabel} initialized successfully`);
    } catch (error) {
      console.error(`❌ Error initializing Supabase Service${routeLabel}:`, error);
      this._client = null as unknown as SupabaseClient;
      this.initialized = false;
    }
  }

  /**
   * Get or create instance of SupabaseService for specific route
   * @param route - Route path (example: 'fms', 'master'). If not provided, use default
   * @returns SupabaseService instance
   */
  public static getInstance(route: SupabaseRoute = undefined): SupabaseService {
    const routeKey = route || "default";
    
    if (!SupabaseService.instances.has(routeKey)) {
      console.log(`📦 Creating new Supabase Service instance for route: ${routeKey}`);
      SupabaseService.instances.set(routeKey, new SupabaseService(route));
    } else {
      console.log(`♻️ Reusing existing Supabase Service instance for route: ${routeKey}`);
    }
    
    return SupabaseService.instances.get(routeKey)!;
  }

  /**
   * Get Supabase client instance
   * Client will automatically use headers from Gateway (apiKey, Authorization)
   * Headers are automatically added to each request through custom fetch function
   */
  get client(): SupabaseClient {
    if (!this.initialized) {
      console.warn(`⚠️ Supabase Service (route: ${this.route}) not properly initialized`);
    }
    return this._client;
  }

  /**
   * Get current route of this service
   */
  get currentRoute(): string {
    return this.route;
  }
}

// Export default instance (no route)
export const supabaseService = SupabaseService.getInstance();

// Export instances for specific routes
export const supabaseFmsService = SupabaseService.getInstance("fms");
export const supabaseMasterService = SupabaseService.getInstance("master-data");

// Export class and factory function for testing purposes
export { SupabaseService };

/**
 * Factory function to create Supabase service for custom route
 * @param route - Route path (example: 'fms', 'master')
 * @returns SupabaseService instance
 */
export const createSupabaseService = (route: string): SupabaseService => {
  return SupabaseService.getInstance(route);
};

