# Secure Refresh Token Implementation Plan

## Objective
Transition the authentication system from a simple, `localStorage`-based JWT to a secure, dual-token architecture utilizing `HttpOnly` cookies to mitigate XSS vulnerabilities and improve token lifecycle management.

## 1. Backend Implementation (FastAPI)

### Updates to `api/routes/auth.py`
1.  **Token Generation:** Update the logic to generate both an `access_token` (short-lived, e.g., 15 mins) and a `refresh_token` (long-lived, e.g., 7 days).
2.  **`POST /auth/login` modification:** 
    *   Generate both tokens.
    *   Set the `refresh_token` as an `HttpOnly`, `Secure`, `SameSite='Lax'` cookie on the response.
    *   Return only the `access_token` in the JSON body.
3.  **New Endpoint `POST /auth/refresh`:**
    *   Read the `refresh_token` from the incoming cookies.
    *   Validate the token signature and expiration.
    *   If valid, generate a new `access_token` and return it in the JSON body.
4.  **New Endpoint `POST /auth/logout`:**
    *   Clear the `refresh_token` cookie from the client's browser.

## 2. Frontend Implementation (React/Vite)

### Updates to `frontend/src/api/client.ts`
1.  **Credentials:** Ensure Axios is configured with `withCredentials: true` globally so cookies are sent with every request.
2.  **Request Interceptor:** Update to retrieve the `access_token` from memory (not `localStorage`) if available.
3.  **Response Interceptor (The "Silent Refresh"):** 
    *   If a request fails with a `401 Unauthorized` and the original request hasn't been retried yet.
    *   Call the `/auth/refresh` endpoint.
    *   If successful, update the in-memory token and retry the failed request.
    *   If the refresh fails, redirect to the `/login` page.

### Updates to `frontend/src/context/AuthContext.tsx`
1.  **Remove `localStorage`:** Completely remove all references to `localStorage.getItem('token')` and `setItem`.
2.  **In-Memory Token:** Add state to hold the `accessToken`.
3.  **Initial Load (`checkAuth`):** Change the `checkAuth` function to immediately attempt to hit `/auth/refresh` on page load. If it succeeds (because the user has a valid HttpOnly cookie), set the user state.
4.  **Login/Logout functions:** Update to handle the new API responses and clear the in-memory state on logout.

## 3. Verification Steps
1.  Log in via the UI and verify that an `HttpOnly` cookie is set in the browser's developer tools (Application -> Cookies).
2.  Verify `localStorage` is empty.
3.  Wait 15 minutes (or artificially shorten the access token lifespan) and ensure a protected API call automatically triggers a `/refresh` request before succeeding.
4.  Verify that logging out clears the cookie and redirects to the login page.