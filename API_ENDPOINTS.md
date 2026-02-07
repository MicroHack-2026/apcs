# API Endpoints Documentation

This document describes all API endpoints that the Spring Boot backend needs to implement.

**Base URL**: `http://localhost:8080/api` (configurable via `VITE_API_BASE_URL`)

**Authentication**: All endpoints (except `/auth/login`) require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

**Response Format**: All endpoints should return JSON in one of these formats:

1. **Standard Response** (recommended):
```json
{
  "data": { ... },
  "success": true,
  "message": "Optional message"
}
```

2. **Spring Boot ResponseEntity** (also supported):
```json
{
  "data": { ... },
  "message": "...",
  "success": true
}
```

3. **Direct Data** (also supported):
```json
{ ... }
```

**Error Response Format**:
```json
{
  "code": "ERROR_CODE",
  "message": "Error message",
  "details": { ... },
  "timestamp": "2025-01-15T10:30:00Z",
  "path": "/api/endpoint"
}
```

---

## Authentication Endpoints

### POST `/auth/login`
Login and get authentication token.

**Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "role": "ADMIN" | "ENTERPRISE" | "MANAGER"
}
```

**Response**:
```json
{
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": "string",
      "username": "string",
      "role": "ADMIN" | "ENTERPRISE" | "MANAGER",
      "email": "string"
    }
  },
  "success": true
}
```

**Status Codes**:
- `200` - Success
- `401` - Invalid credentials

---

## User Management Endpoints

### GET `/users`
Get all users (Admin only).

**Response**:
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "ADMIN" | "ENTERPRISE" | "MANAGER",
      "status": "Active" | "Disabled",
      "createdAt": "2025-01-15"
    }
  ],
  "success": true
}
```

### GET `/users/{id}`
Get user by ID.

**Response**:
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "ADMIN" | "ENTERPRISE" | "MANAGER",
    "status": "Active" | "Disabled",
    "createdAt": "2025-01-15"
  },
  "success": true
}
```

### POST `/users`
Create a new user (Admin only).

**Request Body**:
```json
{
  "name": "string",
  "email": "string",
  "role": "ADMIN" | "ENTERPRISE" | "MANAGER",
  "status": "Active" | "Disabled"
}
```

**Response**:
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "ADMIN" | "ENTERPRISE" | "MANAGER",
    "status": "Active" | "Disabled",
    "createdAt": "2025-01-15"
  },
  "success": true,
  "message": "User created successfully"
}
```

### PUT `/users/{id}`
Update user (Admin only).

**Request Body**:
```json
{
  "name": "string",
  "email": "string",
  "role": "ADMIN" | "ENTERPRISE" | "MANAGER",
  "status": "Active" | "Disabled"
}
```

**Response**: Same as POST `/users`

### PATCH `/users/{id}/toggle-status`
Toggle user status (Active/Disabled).

**Response**:
```json
{
  "data": {
    "id": "string",
    "status": "Active" | "Disabled",
    ...
  },
  "success": true
}
```

---

## Enterprise Owners Endpoints

### GET `/enterprise-owners`
Get all enterprise owners (Admin only).

**Response**:
```json
{
  "data": [
    {
      "id": "string",
      "companyName": "string",
      "ownerName": "string",
      "email": "string",
      "containersCount": 0,
      "status": "Active" | "Disabled",
      "createdAt": "2025-01-15"
    }
  ],
  "success": true
}
```

### GET `/enterprise-owners/{id}`
Get enterprise owner by ID.

**Response**: Single enterprise owner object

### POST `/enterprise-owners`
Create new enterprise owner (Admin only).

**Request Body**:
```json
{
  "companyName": "string",
  "ownerName": "string",
  "email": "string",
  "status": "Active" | "Disabled"
}
```

**Response**: Created enterprise owner object

### PUT `/enterprise-owners/{id}`
Update enterprise owner (Admin only).

**Request Body**:
```json
{
  "companyName": "string",
  "ownerName": "string",
  "email": "string",
  "status": "Active" | "Disabled"
}
```

**Response**: Updated enterprise owner object

---

## Container Endpoints

### GET `/containers`
Get all containers (Enterprise role).

**Query Parameters** (optional):
- `status`: Filter by status (`arrived`, `not-arrived`, `scheduled`)
- `enterpriseId`: Filter by enterprise owner ID

**Response**:
```json
{
  "data": [
    {
      "id": "string",
      "date": "2025-01-15",
      "time": "10:30",
      "arrived": true,
      "scheduled": false,
      "appointmentDate": "2025-01-16",
      "appointmentHour": "14:00"
    }
  ],
  "success": true
}
```

### GET `/containers/{id}`
Get container by ID.

**Response**: Single container object

### PUT `/containers/{id}`
Update container (e.g., mark as arrived, update appointment).

**Request Body**:
```json
{
  "arrived": true,
  "scheduled": true,
  "appointmentDate": "2025-01-16",
  "appointmentHour": "14:00"
}
```

**Response**: Updated container object

---

## Booking Endpoints

### GET `/bookings/availability/{containerId}`
Get available dates and time slots for booking.

**Response**:
```json
{
  "data": {
    "availableDates": ["2025-01-16", "2025-01-17", ...],
    "timesByDate": {
      "2025-01-16": ["08:00", "08:30", "09:00", ...],
      "2025-01-17": ["08:00", "08:30", "09:00", ...]
    }
  },
  "success": true
}
```

### POST `/bookings`
Create a new booking/appointment.

**Request Body**:
```json
{
  "containerId": "string",
  "date": "2025-01-16",
  "hour": "14:00"
}
```

**Response**:
```json
{
  "data": {
    "bookingId": "string",
    "containerId": "string",
    "date": "2025-01-16",
    "time": "14:00",
    "status": "confirmed"
  },
  "success": true,
  "message": "Appointment scheduled successfully"
}
```

### GET `/bookings/{bookingId}`
Get booking by ID.

**Response**: Booking object with QR code data

---

## Statistics Endpoints (Admin)

### GET `/stats/admin`
Get admin dashboard statistics.

**Response**:
```json
{
  "data": {
    "totalEnterprises": 0,
    "totalManagers": 0,
    "totalContainers": 0,
    "appointmentsScheduled": 0,
    "arrivedCount": 0,
    "notArrivedCount": 0
  },
  "success": true
}
```

### GET `/stats/recent-activity`
Get recent activity feed.

**Response**:
```json
{
  "data": [
    {
      "id": "string",
      "message": "string",
      "timestamp": "10 minutes ago"
    }
  ],
  "success": true
}
```

---

## Settings Endpoints (Admin)

### GET `/settings`
Get platform settings.

**Response**:
```json
{
  "data": {
    "platformName": "string",
    "defaultTimeZone": "string",
    "slotDurationMinutes": 60,
    "defaultCapacity": 5,
    "notifyOnBooking": true,
    "notifyOnArrival": true,
    "notifyOnCancellation": false,
    "maintenanceMode": false
  },
  "success": true
}
```

### PUT `/settings`
Update platform settings (Admin only).

**Request Body**:
```json
{
  "platformName": "string",
  "defaultTimeZone": "string",
  "slotDurationMinutes": 60,
  "defaultCapacity": 5,
  "notifyOnBooking": true,
  "notifyOnArrival": true,
  "notifyOnCancellation": false,
  "maintenanceMode": false
}
```

**Response**: Updated settings object

---

## QR Code Endpoints

### GET `/bookings/{bookingId}/qr`
Get QR code data for a booking (for scanning).

**Response**:
```json
{
  "data": {
    "bookingId": "string",
    "containerId": "string",
    "date": "2025-01-16",
    "time": "14:00",
    "qrData": "base64_encoded_qr_image_or_json_string"
  },
  "success": true
}
```

### POST `/bookings/verify`
Verify a scanned QR code (Manager role).

**Request Body**:
```json
{
  "qrData": "string" // JSON string or booking ID
}
```

**Response**:
```json
{
  "data": {
    "bookingId": "string",
    "containerId": "string",
    "date": "2025-01-16",
    "time": "14:00",
    "verified": true
  },
  "success": true
}
```

---

## Error Handling

All endpoints should return appropriate HTTP status codes:

- `200` - Success
- `201` - Created (for POST requests)
- `204` - No Content (for DELETE requests)
- `400` - Bad Request
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

---

## CORS Configuration

The Spring Boot backend must allow CORS from the frontend origin:

```java
@CrossOrigin(origins = "http://localhost:8080") // or your frontend URL
```

Or configure globally in Spring Boot configuration.

---

## Notes for Backend Developer

1. **Date Format**: Use ISO 8601 format (`YYYY-MM-DD`) for dates
2. **Time Format**: Use 24-hour format (`HH:mm`) for times
3. **ID Format**: Use string IDs (e.g., "USR-001", "ENT-001", "CNTR-001")
4. **Status Values**: Use exact strings: "Active", "Disabled", "arrived", "not-arrived", "scheduled"
5. **Role Values**: Use exact strings: "ADMIN", "ENTERPRISE", "MANAGER"
6. **Pagination**: If implementing pagination, use Spring Boot's `Pageable` interface
7. **Validation**: Validate all input data and return clear error messages
8. **Security**: Implement proper JWT token validation and role-based access control

---

## Testing

You can test the API integration by:

1. Set `VITE_USE_MOCK_DATA=false` in `.env` file
2. Start your Spring Boot backend on `http://localhost:8080`
3. The frontend will automatically use the real API instead of mock data
