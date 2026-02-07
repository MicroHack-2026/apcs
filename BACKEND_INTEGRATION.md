# Backend Integration Guide

This guide helps backend developers integrate the Spring Boot backend with the Portly frontend.

## Quick Start

1. **Review API Documentation**: See `API_ENDPOINTS.md` for all required endpoints
2. **Configure CORS**: Allow requests from `http://localhost:8080` (or your frontend URL)
3. **Implement Endpoints**: Follow the endpoint specifications in `API_ENDPOINTS.md`
4. **Test Integration**: Set `VITE_USE_MOCK_DATA=false` in frontend `.env` file

## API Client Architecture

The frontend uses a centralized API client (`src/services/apiClient.ts`) that:

- Automatically adds JWT tokens to requests
- Handles errors and converts them to a standard format
- Supports multiple response formats (Spring Boot ResponseEntity, direct data, etc.)
- Manages authentication state

## TanStack Query Integration

The frontend uses **TanStack Query (React Query)** for all data fetching:

- **Automatic caching** - Reduces API calls, same data requested multiple times only fetches once
- **Background refetching** - Data stays fresh automatically (configurable intervals)
- **Loading/error states** - Built-in state management
- **Automatic cache invalidation** - After mutations, related data refreshes automatically
- **Request deduplication** - Multiple components requesting same data = one API call

**Benefits for Backend:**
- Reduced server load (caching prevents duplicate requests)
- Better user experience (instant loading from cache)
- Automatic error handling and retries
- Background data synchronization

See `TANSTACK_QUERY_SETUP.md` for complete documentation.

## Authentication Flow

1. **Login**: `POST /auth/login` returns a JWT token
2. **Token Storage**: Frontend stores token in localStorage
3. **Automatic Headers**: All subsequent requests include `Authorization: Bearer <token>`
4. **Token Refresh**: Handle 401 responses to redirect to login

## Response Format Options

The frontend supports three response formats. Choose one and be consistent:

### Option 1: Standard Response (Recommended)
```json
{
  "data": { ... },
  "success": true,
  "message": "Optional message"
}
```

### Option 2: Spring Boot ResponseEntity
```json
{
  "data": { ... },
  "message": "...",
  "success": true
}
```

### Option 3: Direct Data
```json
{ ... }
```

## Error Response Format

Always return errors in this format:
```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": { ... },
  "timestamp": "2025-01-15T10:30:00Z",
  "path": "/api/endpoint"
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created (for POST requests)
- `204` - No Content (for DELETE requests)
- `400` - Bad Request
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

## CORS Configuration

Add CORS configuration to your Spring Boot application:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:8080")
                    .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

## JWT Token Implementation

1. **Token Generation**: Generate JWT tokens on successful login
2. **Token Validation**: Validate tokens on protected endpoints
3. **Token Expiry**: Set appropriate expiry times (e.g., 24 hours)
4. **Token Refresh**: Optionally implement refresh token mechanism

Example Spring Security JWT configuration:
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // JWT configuration
    // Token validation filter
    // Authentication entry point
}
```

## Data Formats

### Dates
- Format: `YYYY-MM-DD` (ISO 8601 date format)
- Example: `"2025-01-15"`

### Times
- Format: `HH:mm` (24-hour format)
- Example: `"14:30"`

### IDs
- Format: String identifiers
- Examples: `"USR-001"`, `"ENT-001"`, `"CNTR-001"`

### Status Values
- Users/Enterprises: `"Active"` or `"Disabled"`
- Containers: `"arrived"`, `"not-arrived"`, `"scheduled"`

### Role Values
- `"ADMIN"`, `"ENTERPRISE"`, `"MANAGER"`

## Testing the Integration

1. **Start Backend**: Run your Spring Boot application on port 8080
2. **Configure Frontend**: Set `VITE_USE_MOCK_DATA=false` in `.env`
3. **Test Login**: Try logging in - should receive JWT token
4. **Test Endpoints**: Navigate through the app and verify API calls
5. **Check Console**: Monitor browser console for API errors

## Common Issues

### CORS Errors
- Ensure CORS is properly configured in Spring Boot
- Check that frontend URL matches allowed origins

### 401 Unauthorized
- Verify JWT token is being sent in Authorization header
- Check token validation logic
- Ensure token hasn't expired

### 404 Not Found
- Verify endpoint paths match `API_ENDPOINTS.md`
- Check Spring Boot `@RequestMapping` annotations

### Network Errors
- Verify backend is running
- Check `VITE_API_BASE_URL` in frontend `.env`
- Ensure backend is accessible from frontend

## Development Tips

1. **Use Mock Data First**: Frontend works with mock data, so you can develop independently
2. **Incremental Integration**: Implement endpoints one at a time
3. **Test Each Endpoint**: Use Postman or similar to test before frontend integration
4. **Check Logs**: Monitor both frontend console and backend logs
5. **Error Messages**: Provide clear, actionable error messages

## Next Steps

1. Review `API_ENDPOINTS.md` for detailed endpoint specifications
2. Set up your Spring Boot project structure
3. Implement authentication endpoints first
4. Then implement CRUD endpoints for each resource
5. Test with frontend by setting `VITE_USE_MOCK_DATA=false`

## Support

For questions or issues:
- Check `API_ENDPOINTS.md` for endpoint details
- Review frontend service files in `src/services/` for expected data formats
- Check browser console for detailed error messages
