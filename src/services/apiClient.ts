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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const TOKEN_KEY = "portly_auth_token";

const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

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

const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await handleApiError(response);
      
      if (response.status === 401) {
        removeAuthToken();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
      
      throw error;
    }

    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return {
        data: null as T,
        success: true,
      };
    }

    const data = await response.json();
    
    if (data.data !== undefined) {
      return {
        data: data.data as T,
        success: data.success !== false,
        message: data.message,
      };
    }

    if (data.success !== undefined) {
      return data as ApiResponse<T>;
    }

    return {
      data: data as T,
      success: true,
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw {
        code: "NETWORK_ERROR",
        message: "Unable to connect to the server. Please check your connection.",
      } as ApiError;
    }

    if (error && typeof error === "object" && "code" in error) {
      throw error;
    }

    throw {
      code: "UNKNOWN_ERROR",
      message: error instanceof Error ? error.message : "An unknown error occurred",
    } as ApiError;
  }
};

export const apiClient = {
  baseUrl: API_BASE_URL,

  get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    return makeRequest<T>(endpoint, {
      method: "GET",
    });
  },

  post: async <T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> => {
    return makeRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put: async <T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> => {
    return makeRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  patch: async <T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> => {
    return makeRequest<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    return makeRequest<T>(endpoint, {
      method: "DELETE",
    });
  },
};
