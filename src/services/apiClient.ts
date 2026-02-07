/**
 * API Client for Spring Boot Backend Integration
 * 
 * This client handles all HTTP requests to the backend API.
 * It includes:
 * - Automatic authentication token handling
 * - Request/response interceptors
 * - Error handling
 * - Type-safe API calls
 * 
 * Backend Base URL: Configure via VITE_API_BASE_URL environment variable
 * Default: http://localhost:8080/api
 */

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp?: string;
  path?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Base URL from environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Token storage key
const TOKEN_KEY = "portly_auth_token";

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set authentication token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Handle API errors and convert to ApiError format
 */
const handleApiError = async (response: Response): Promise<ApiError> => {
  let errorData: any;
  
  try {
    errorData = await response.json();
  } catch {
    errorData = {
      message: response.statusText || "An error occurred",
    };
  }

  const apiError: ApiError = {
    code: errorData.code || `HTTP_${response.status}`,
    message: errorData.message || errorData.error || "An error occurred",
    details: errorData.details || errorData,
    timestamp: errorData.timestamp,
    path: errorData.path,
  };

  return apiError;
};

/**
 * Make HTTP request with authentication and error handling
 */
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  // Prepare headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add authorization token if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle non-2xx responses
    if (!response.ok) {
      const error = await handleApiError(response);
      
      // Handle 401 Unauthorized - clear token and redirect to login
      if (response.status === 401) {
        removeAuthToken();
        // Optionally trigger logout
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
      
      throw error;
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return {
        data: null as T,
        success: true,
      };
    }

    // Parse JSON response
    const data = await response.json();
    
    // Handle Spring Boot ResponseEntity format
    // Spring Boot often returns: { data: {...}, message: "...", success: true }
    // Or directly returns the data
    if (data.data !== undefined) {
      return {
        data: data.data as T,
        success: data.success !== false,
        message: data.message,
      };
    }

    // If response is already in ApiResponse format
    if (data.success !== undefined) {
      return data as ApiResponse<T>;
    }

    // If response is direct data (Spring Boot default)
    return {
      data: data as T,
      success: true,
    };
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw {
        code: "NETWORK_ERROR",
        message: "Unable to connect to the server. Please check your connection.",
      } as ApiError;
    }

    // Re-throw ApiError
    if (error && typeof error === "object" && "code" in error) {
      throw error;
    }

    // Unknown error
    throw {
      code: "UNKNOWN_ERROR",
      message: error instanceof Error ? error.message : "An unknown error occurred",
    } as ApiError;
  }
};

/**
 * API Client with HTTP methods
 * 
 * All methods return ApiResponse<T> which matches Spring Boot ResponseEntity format
 */
export const apiClient = {
  baseUrl: API_BASE_URL,

  /**
   * GET request
   * @param endpoint - API endpoint (e.g., "/users" or "/containers/123")
   * @returns Promise with ApiResponse containing data
   */
  get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    return makeRequest<T>(endpoint, {
      method: "GET",
    });
  },

  /**
   * POST request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @returns Promise with ApiResponse containing created/result data
   */
  post: async <T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> => {
    return makeRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PUT request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @returns Promise with ApiResponse containing updated data
   */
  put: async <T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> => {
    return makeRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PATCH request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @returns Promise with ApiResponse containing updated data
   */
  patch: async <T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> => {
    return makeRequest<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * DELETE request
   * @param endpoint - API endpoint
   * @returns Promise with ApiResponse
   */
  delete: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    return makeRequest<T>(endpoint, {
      method: "DELETE",
    });
  },
};
