export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== "false";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

if (import.meta.env.DEV) {
  console.log("🔧 Configuration:", {
    useMockData: USE_MOCK_DATA,
    apiBaseUrl: API_BASE_URL,
  });
}
