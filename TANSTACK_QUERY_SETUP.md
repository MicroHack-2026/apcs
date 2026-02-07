# TanStack Query Setup Guide

This document explains how TanStack Query (React Query) is configured and used in the Portly application.

## Overview

TanStack Query is fully integrated into the application to provide:
- **Automatic caching** - Data is cached and reused across components
- **Background refetching** - Data stays fresh automatically
- **Loading/error states** - Built-in state management
- **Optimistic updates** - Instant UI feedback
- **Request deduplication** - Multiple components share the same request
- **Automatic retries** - Handles network failures gracefully

## Configuration

### QueryClient Setup (`src/lib/queryClient.ts`)

The QueryClient is configured with sensible defaults:

```typescript
{
  queries: {
    staleTime: 5 minutes,        // Data is fresh for 5 minutes
    gcTime: 10 minutes,          // Cache kept for 10 minutes
    retry: 1,                    // Retry failed requests once
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true,        // Refetch when component mounts
    refetchOnReconnect: true,  // Refetch when network reconnects
  },
  mutations: {
    retry: 1,                    // Retry failed mutations once
  },
}
```

## Custom Hooks

All data fetching is done through custom hooks in `src/hooks/`:

### Available Hooks

#### Users (`useUsers.ts`)
- `useUsers()` - Get all users
- `useUser(id)` - Get single user by ID
- `useCreateUser()` - Create new user mutation
- `useUpdateUser()` - Update user mutation
- `useToggleUserStatus()` - Toggle user status mutation

#### Enterprise Owners (`useEnterpriseOwners.ts`)
- `useEnterpriseOwners()` - Get all enterprise owners
- `useEnterpriseOwner(id)` - Get single enterprise owner by ID
- `useCreateEnterpriseOwner()` - Create new enterprise owner mutation
- `useUpdateEnterpriseOwner()` - Update enterprise owner mutation

#### Containers (`useContainers.ts`)
- `useContainers()` - Get all containers
- `useContainer(id)` - Get single container by ID
- `useUpdateContainer()` - Update container mutation

#### Bookings (`useBookings.ts`)
- `usePickupAvailability(containerId)` - Get available dates/times for booking
- `useAvailableDates()` - Get all available dates
- `useAvailableHours(date)` - Get available hours for a date
- `useCreateBooking()` - Create booking mutation

#### Statistics (`useStats.ts`)
- `useAdminStats()` - Get admin dashboard statistics (auto-refreshes every 5 minutes)
- `useRecentActivity()` - Get recent activity feed (auto-refreshes every 2 minutes)
- `useUpcomingAppointments()` - Get upcoming appointments

#### Settings (`useSettings.ts`)
- `useSettings()` - Get platform settings
- `useUpdateSettings()` - Update settings mutation

## Usage Examples

### Basic Query

```typescript
import { useEnterpriseOwners } from "@/hooks/useEnterpriseOwners";

function MyComponent() {
  const { data: owners = [], isLoading, error } = useEnterpriseOwners();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {owners.map(owner => <div key={owner.id}>{owner.companyName}</div>)}
    </div>
  );
}
```

### Mutation

```typescript
import { useCreateEnterpriseOwner } from "@/hooks/useEnterpriseOwners";

function CreateOwnerForm() {
  const createMutation = useCreateEnterpriseOwner();

  const handleSubmit = (data) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        console.log("Owner created!");
      },
      onError: (error) => {
        console.error("Failed:", error);
      },
    });
  };

  return (
    <button 
      onClick={handleSubmit}
      disabled={createMutation.isPending}
    >
      {createMutation.isPending ? "Creating..." : "Create"}
    </button>
  );
}
```

## Automatic Cache Invalidation

When mutations succeed, the cache is automatically invalidated:

- Creating/updating a user → invalidates `["users"]` and `["users", id]`
- Creating/updating enterprise owner → invalidates `["enterpriseOwners"]` and `["enterpriseOwners", id]`
- Creating booking → invalidates `["containers"]`, `["pickupAvailability"]`, etc.

This means:
- ✅ No manual refetching needed
- ✅ UI updates automatically
- ✅ Data stays in sync

## Benefits for Backend Integration

1. **Automatic Caching**: Reduces API calls - same data requested multiple times only fetches once
2. **Background Updates**: Data refreshes automatically in the background
3. **Error Handling**: Built-in error states and retry logic
4. **Loading States**: Automatic loading indicators
5. **Optimistic Updates**: Can show changes immediately before server confirms
6. **Request Deduplication**: Multiple components requesting same data = one API call

## Query Keys

Query keys are used to identify and manage cached data:

- `["users"]` - All users
- `["users", id]` - Single user
- `["enterpriseOwners"]` - All enterprise owners
- `["enterpriseOwners", id]` - Single enterprise owner
- `["containers"]` - All containers
- `["containers", id]` - Single container
- `["pickupAvailability", containerId]` - Booking availability
- `["adminStats"]` - Dashboard statistics
- `["recentActivity"]` - Recent activity feed
- `["settings"]` - Platform settings

## Manual Cache Management

If you need to manually invalidate or refetch:

```typescript
import { useQueryClient } from "@tanstack/react-query";

function MyComponent() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ["users"] });
    
    // Or just refetch without invalidating
    queryClient.refetchQueries({ queryKey: ["users"] });
  };
}
```

## Development Tools

React Query DevTools can be added for development (optional):

```bash
npm install @tanstack/react-query-devtools --save-dev
```

Then add to `App.tsx`:
```typescript
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

{import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
```

## Best Practices

1. **Use the hooks** - Don't call services directly in components
2. **Handle loading/error states** - Always check `isLoading` and `error`
3. **Use mutations for writes** - All create/update/delete operations use mutations
4. **Let cache invalidation work** - Don't manually refetch after mutations
5. **Use query keys consistently** - Follow the pattern in existing hooks

## Migration Notes

All pages have been migrated from manual `useState` + `useEffect` to TanStack Query hooks:

- ✅ `AdminDashboardPage` - Uses `useAdminStats()` and `useRecentActivity()`
- ✅ `AdminUsersPage` - Uses `useUsers()`, `useCreateUser()`, `useUpdateUser()`, `useToggleUserStatus()`
- ✅ `AdminEnterpriseOwnersPage` - Uses `useEnterpriseOwners()`, `useCreateEnterpriseOwner()`, `useUpdateEnterpriseOwner()`
- ✅ `EnterprisePage` - Uses `useContainers()`
- ✅ `BookingModal` - Uses `usePickupAvailability()`, `useAvailableHours()`, `useCreateBooking()`
- ✅ `AdminSettingsPage` - Uses `useSettings()`, `useUpdateSettings()`

## For Backend Developers

The TanStack Query setup works seamlessly with your Spring Boot backend:

1. **No changes needed** - The hooks automatically use your API when `VITE_USE_MOCK_DATA=false`
2. **Automatic caching** - Reduces load on your backend
3. **Error handling** - Built-in retry and error states
4. **Background updates** - Keeps data fresh automatically

The backend just needs to implement the endpoints as documented in `API_ENDPOINTS.md` - the frontend handles all the caching, loading states, and data synchronization automatically.
