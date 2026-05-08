# Security Audit Report

## Overview
A comprehensive security audit was performed on the HackAI 2026 Boilerplate application. The audit focused on the authentication logic (JWT), frontend token storage, dependency vulnerabilities, and general API configurations.

## Findings & Recommendations

### 1. High Risk: Cleartext Storage of Sensitive Information (XSS Exposure)
*   **Location:** `frontend/src/api/client.ts` and `frontend/src/context/AuthContext.tsx`
*   **Issue:** The JWT access token is stored in the browser's `localStorage`.
*   **Vulnerability:** `localStorage` is fully accessible to any JavaScript running on the page. If your application suffers from a Cross-Site Scripting (XSS) vulnerability (e.g., rendering unescaped user input), an attacker can easily steal the access tokens.
*   **Remediation:** 
    *   Store the access token in memory (React state) rather than `localStorage`.
    *   Implement **Refresh Tokens** stored in an `HttpOnly`, `Secure`, and `SameSite` cookie. The frontend can use a silent request to exchange the refresh token for a new access token without the token ever touching JavaScript-accessible storage.
    *   *Hackathon Exception:* If you must keep it in `localStorage` for speed during the event, ensure strict React rendering (avoiding `dangerouslySetInnerHTML`) to minimize XSS risks.

### 2. High Risk: Overly Permissive CORS Configuration
*   **Location:** `api/main.py`
*   **Issue:** `allow_origins=["*"]` is currently set.
*   **Vulnerability:** Any website on the internet can make cross-origin requests to your API. If combined with cookie-based authentication in the future, this could lead to Cross-Site Request Forgery (CSRF) or unauthorized data access.
*   **Remediation:** Restrict the allowed origins to your specific frontend URL.
    ```python
    allow_origins=[
        "http://localhost:5173", # Local dev
        "https://your-hackathon-domain.com" # Production
    ]
    ```

### 3. Medium Risk: Predictable Secret Key Fallback
*   **Location:** `api/routes/auth.py`
*   **Issue:** `SECRET_KEY = os.getenv("SECRET_KEY", "yoursecretkeyhere")`
*   **Vulnerability:** If the `.env` file is accidentally omitted in the production environment, the backend will silently fall back to the hardcoded `"yoursecretkeyhere"`. An attacker who knows this boilerplate could forge administrative JWT tokens.
*   **Remediation:** Fail fast if the key is missing in a production-like environment.
    ```python
    import os
    SECRET_KEY = os.getenv("SECRET_KEY")
    if not SECRET_KEY:
        raise ValueError("No SECRET_KEY set for FastAPI application. Check .env file.")
    ```

### 4. Low Risk: Unverifiable Token Revocation
*   **Location:** `api/routes/auth.py`
*   **Issue:** The application uses "Simple JWTs" with an expiration of 30 minutes.
*   **Vulnerability:** JWTs are stateless. If a token is compromised, there is no built-in way to "revoke" it or log the user out on the server side until the 30 minutes have passed. 
*   **Remediation:** Implement a Refresh Token flow, or keep an in-memory Redis blocklist for revoked tokens. 

### 5. Dependency Vulnerability: Minerva Timing Attack in `ecdsa` (CVE-2024-23342)
*   **Scanner:** OSV Scanner (GHSA-wj6h-64fc-37mp)
*   **Location:** `requirements.txt` -> `python-jose[cryptography]` -> `ecdsa`
*   **Issue:** The `ecdsa` library is subject to a side-channel timing attack on the P-256 curve. The project maintainers consider this out of scope, so no patch is available.
*   **Context:** **This is a False Positive for our use case.** We are using the `HS256` (HMAC with SHA-256) symmetric algorithm, not Elliptic Curve Digital Signatures (ECDSA). We are completely unaffected.
*   **Remediation:** No action is strictly required. However, to silence the vulnerability scanner, you can migrate from `python-jose` to the modern, actively maintained `PyJWT` library, which does not require the `ecdsa` dependency for basic HMAC usage.

## Conclusion
The application provides a solid foundation for a hackathon. The most pressing architectural decision before adding production data is whether to transition from `localStorage` JWTs to `HttpOnly` cookie-based sessions to mitigate XSS token theft.