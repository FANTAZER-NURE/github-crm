# Authentication Service

This directory contains the client-side implementation of the authentication service for the GitHub CRM application.

## Structure

- **`/services/authService.ts`**: The main authentication service that handles login, registration, logout, and other auth-related operations.
- **`/utils/httpClient.ts`**: A utility for creating configured Axios instances with auth headers and interceptors.
- **`/contexts/AuthContext.tsx`**: React Context for managing authentication state across the application.
- **`/components/ProtectedRoute.tsx`**: Component for protecting routes that require authentication or verified email.
- **`/pages/`**: Authentication-related pages (login, register, profile, etc.)

## Authentication Flow

1. **Registration**:

   - User submits registration form
   - Service sends request to the server
   - Server creates user and sends verification email
   - User is redirected to verification required page

2. **Email Verification**:

   - User clicks on verification link in email
   - Service verifies the token with the server
   - Server marks user as verified
   - User is redirected to login or home page

3. **Login**:

   - User submits login form
   - Service authenticates with the server
   - Server returns JWT token and user data
   - Token is stored in localStorage
   - User is redirected to the protected area

4. **Protected Routes**:

   - Routes requiring authentication check for token presence
   - Some routes may require email verification
   - Unauthorized users are redirected to login

5. **Token Management**:
   - Token is attached to all authenticated requests
   - Expired/invalid tokens trigger automatic logout
   - HTTP 401 responses are handled globally

## Usage

```tsx
// Using auth in a component
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth();

  // Now you can use auth functions and state
};
```
