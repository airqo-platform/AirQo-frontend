**AirQo Platform API Reference**

OAuth 2.0 Social Login — All Providers

Version 3.1  •  March 2026

**Audience: Frontend Engineers (Next.js Web  •  Flutter Mobile)**

| 🔵  IMPORTANT: Use Staging for All Testing All integration testing must be done against the staging environment (staging-api.airqo.net) as it carries the most recent backend changes. Do not use production URLs for testing. Staging base URL:  https://staging-api.airqo.net Production base URL:  https://api.airqo.net  (do not test against this) |
| :---- |

# **1\. Overview**

This document describes the OAuth 2.0 social login integration for the AirQo platform, covering both the Next.js web application and the Flutter mobile app. The backend **auth-service** manages the entire OAuth flow. Frontend applications are only responsible for initiating the flow and handling the outcome.

| Active provider (ready to test now): ✅  Google Implemented in code — awaiting backend credentials to activate: ⏳  GitHub  •  ⏳  LinkedIn  •  ⏳  Microsoft  •  ⏳  Twitter/X |
| :---- |

# **2\. How the Flow Works**

The same four-step pattern applies to every provider. The only thing that changes per provider is the initiation URL.

| Step 1 | Initiate The frontend navigates the browser (web) or launches an in-app browser (Flutter) to the backend auth endpoint for the chosen provider. |
| :---: | :---- |
| **Step 2** | **Provider Auth** The backend redirects to the provider's login and consent screen. The user authenticates and grants access. |
| **Step 3** | **Callback** The provider redirects to the backend callback URL. The backend verifies the identity, finds or creates the user account, links the provider ID, and generates a signed JWT. |
| **Step 4** | **Final Redirect** The backend sets the JWT as a secure HttpOnly cookie (access\_token) and redirects to the configured success or failure URL. The frontend detects this and updates the UI state. |

# **3\. Endpoint Reference**

## **3.1  Initiate Social Login**

| GET | /api/v2/users/auth/:provider |
| :---: | :---- |

Entry point for any provider's OAuth flow. The frontend must **navigate the browser** to this URL — it is not a **fetch()** or AJAX call. For Flutter, open in an in-app browser (see Section 6.2).

| 🔵  Use Staging for All Testing Always use staging-api.airqo.net when testing. The staging environment has the latest changes and is the correct environment for all integration work. |
| :---- |

### **Path Parameter**

| Parameter | Description |
| :---- | :---- |
| :provider | Provider name. Active: google. Pending credentials: github, linkedin, microsoft, twitter |

### **Query Parameter**

| Parameter | Description |
| :---- | :---- |
| tenant | Optional. Tenant identifier. Defaults to airqo if omitted. |

### **Staging URLs — Use These for All Testing**

| \# ✅ Google (ACTIVE — test this now) https://staging-api.airqo.net/api/v2/users/auth/google?tenant=airqo \# ⏳ GitHub (pending credentials — returns 400 until configured) https://staging-api.airqo.net/api/v2/users/auth/github?tenant=airqo \# ⏳ LinkedIn (pending credentials — returns 400 until configured) https://staging-api.airqo.net/api/v2/users/auth/linkedin?tenant=airqo \# ⏳ Microsoft (pending credentials — returns 400 until configured) https://staging-api.airqo.net/api/v2/users/auth/microsoft?tenant=airqo \# ⏳ Twitter/X (pending credentials — returns 400 until configured) https://staging-api.airqo.net/api/v2/users/auth/twitter?tenant=airqo |
| :---- |

### **Production URLs — Do Not Test Against These**

| \# Production (for reference only — do not use for testing) https://api.airqo.net/api/v2/users/auth/google?tenant=airqo https://api.airqo.net/api/v2/users/auth/github?tenant=airqo \# ...same pattern for other providers |
| :---- |

### **Responses**

| Response | Details |
| :---- | :---- |
| Success (302) | Redirects to frontend success URL. Sets access\_token HttpOnly cookie. |
| Failure (302) | Redirects to frontend failure URL. No cookie set. |
| Bad provider (400) | { "success": false, "message": "Unsupported OAuth provider: facebook" } |
| Not configured (400) | { "success": false, "message": "OAuth provider not configured: github" } |

## **3.2  OAuth Callback (Internal — Do Not Call Directly)**

| GET | /api/v2/users/auth/callback/:provider |
| :---: | :---- |

Called by the OAuth provider after the user grants or denies access. **Never call this endpoint directly.** It is documented here only so the correct URIs can be registered in each provider's developer console.

### **Callback URIs to Register in Provider Developer Consoles**

| Provider | Staging (register this) | Production (register this) |
| :---- | :---- | :---- |
| Google ✅ | https://staging-api.airqo.net/api/v2/users/auth/callback/google | https://api.airqo.net/api/v2/users/auth/callback/google |
| GitHub ⏳ | https://staging-api.airqo.net/api/v2/users/auth/callback/github | https://api.airqo.net/api/v2/users/auth/callback/github |
| LinkedIn ⏳ | https://staging-api.airqo.net/api/v2/users/auth/callback/linkedin | https://api.airqo.net/api/v2/users/auth/callback/linkedin |
| Microsoft ⏳ | https://staging-api.airqo.net/api/v2/users/auth/callback/microsoft | https://api.airqo.net/api/v2/users/auth/callback/microsoft |
| Twitter/X ⏳ | https://staging-api.airqo.net/api/v2/users/auth/callback/twitter | https://api.airqo.net/api/v2/users/auth/callback/twitter |

## **3.3  Verify Session After Login**

| GET | /api/v2/users/profile/enhanced |
| :---: | :---- |

After the OAuth redirect lands on the success URL, call this endpoint to confirm the session is valid and retrieve the user profile. Because the **access\_token** cookie is HttpOnly, JavaScript and Dart cannot read it directly — use this endpoint to check authenticated state instead.

### **Headers**

| Header | Value |
| :---- | :---- |
| Authorization | JWT {token\_value} |

### **Staging Test URL**

| GET https://staging-api.airqo.net/api/v2/users/profile/enhanced Authorization: JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... |
| :---- |

### **Success Response (200)**

| {   "success": true,   "message": "Enhanced profile retrieved successfully",   "data": {     "\_id": "64a1b2c3...",     "email": "user@gmail.com",     "firstName": "Test",     "lastName": "User",     "verified": true,     "google\_id": "123456789",     "github\_id": null,     "linkedin\_id": null,     "microsoft\_id": null,     "twitter\_id": null,     "isSuperAdmin": false   } } |
| :---- |

# **4\. Redirect URLs  ⚠️  Frontend Input Required**

The success redirect URL is currently a placeholder and must be agreed between the frontend teams and the backend team before social login can be considered production-ready.

| ⚠️  Frontend Input Needed The current backend success redirect placeholder is /xyz/Home?success={provider} which does not exist on either the web app or the Flutter app. Both frontend teams must confirm:  1\. The exact web path the Next.js app should land on after a successful login (e.g. /dashboard, /home).  2\. The Flutter deep link / custom URI scheme for the mobile success redirect (e.g. airqo://oauth/success).  3\. Whether the ?success=google query parameter is useful for analytics tracking or should be removed.Once confirmed, the backend team will update the environment variables below accordingly. |
| :---- |

### **Current Backend Environment Variables (Staging)**

| \# Staging — values currently deployed GMAIL\_VERIFICATION\_SUCCESS\_REDIRECT=https://staging-analytics.airqo.net  \# ⚠️ placeholder path GMAIL\_VERIFICATION\_FAILURE\_REDIRECT=https://staging-analytics.airqo.net/user/login \# Production — values currently deployed GMAIL\_VERIFICATION\_SUCCESS\_REDIRECT=https://analytics.airqo.net  \# ⚠️ placeholder path GMAIL\_VERIFICATION\_FAILURE\_REDIRECT=https://analytics.airqo.net/user/login |
| :---- |

### **Proposed Final Pattern (Awaiting Confirmation)**

|  | Staging | Production |
| :---- | :---- | :---- |
| Success — Web (TBC) | https://staging-analytics.airqo.net/dashboard | https://analytics.airqo.net/dashboard |
| Failure — Web | https://staging-analytics.airqo.net/user/login | https://analytics.airqo.net/user/login |
| Success — Flutter (TBC) | airqo://oauth/success | airqo://oauth/success |
| Failure — Flutter (TBC) | airqo://oauth/failure | airqo://oauth/failure |

# **5\. Session Management**

| Attribute | Description |
| :---- | :---- |
| Name | access\_token |
| HttpOnly | Cannot be read by JavaScript or Dart. Mitigates XSS. |
| Secure | Transmitted over HTTPS only. |
| SameSite | Restricts cross-site transmission to prevent CSRF. |
| Scope | Automatically included in all subsequent requests to the backend domain. |

| Important: Cookie Accessibility The access\_token cookie is HttpOnly. Neither JavaScript (Next.js) nor Dart (Flutter) can read it directly. Both platforms must call GET /api/v2/users/profile/enhanced after the redirect to retrieve the authenticated user object. |
| :---- |

# **6\. Platform-Specific Integration**

## **6.1  Next.js Web Application**

| 🔵  Use Staging for All Testing Use https://staging-api.airqo.net as NEXT\_PUBLIC\_API\_BASE\_URL in your .env.staging file when testing this integration. |
| :---- |

### **Initiating Login**

Render a standard anchor tag pointing to the staging backend. Do not use **fetch()**, **axios**, or **router.push()** — a full browser navigation is required.

| // components/SocialLoginButtons.tsx // NEXT\_PUBLIC\_API\_BASE\_URL \= https://staging-api.airqo.net (staging) //                          \= https://api.airqo.net (production) const BASE \= process.env.NEXT\_PUBLIC\_API\_BASE\_URL; // ✅ Google — active, test this now export function GoogleLoginButton() {   return (     \<a href={\`${BASE}/api/v2/users/auth/google?tenant=airqo\`}\>       Sign in with Google     \</a\>   ); } // ⏳ GitHub — uncomment once backend credentials are configured // export function GitHubLoginButton() { //   return \<a href={\`${BASE}/api/v2/users/auth/github?tenant=airqo\`}\>Sign in with GitHub\</a\>; // } |
| :---- |

### **Handling the Success Redirect**

| The success path below (/dashboard) is a placeholder. Replace it with the agreed path from Section 4 once confirmed. |
| :---- |

| // app/dashboard/page.tsx // ⚠️  Replace /dashboard with the confirmed success path from Section 4 'use client'; import { useEffect } from 'react'; import { useRouter } from 'next/navigation'; export default function DashboardPage() {   const router \= useRouter();   useEffect(() \=\> {     // The access\_token cookie was set by the backend redirect.     // Fetch the profile to confirm the session and hydrate app state.     fetch(       \`${process.env.NEXT\_PUBLIC\_API\_BASE\_URL}/api/v2/users/profile/enhanced\`,       { credentials: 'include' } // sends the HttpOnly cookie automatically     )       .then(res \=\> res.json())       .then(data \=\> {         if (data.success) {           // Store user in global state (Context, Zustand, Redux, etc.)           console.log('Authenticated user:', data.data);         } else {           router.push('/user/login');         }       })       .catch(() \=\> router.push('/user/login'));   }, \[\]);   return \<div\>Loading...\</div\>; } |
| :---- |

### **Handling the Failure Redirect**

| // app/user/login/page.tsx 'use client'; import { useSearchParams } from 'next/navigation'; export default function LoginPage() {   const params \= useSearchParams();   // Backend redirects here on OAuth failure   const oauthFailed \= params.get('error') || params.has('failed');   return (     \<div\>       {oauthFailed && (         \<p\>Sign-in failed. Please try again or use email and password.\</p\>       )}       {/\* ... rest of login form ... \*/}     \</div\>   ); } |
| :---- |

| ⚠️  Frontend Input Needed Next.js team: Please confirm (1) the exact success redirect page path and (2) whether the ?success=google query parameter should be preserved for analytics. This unblocks the backend team from updating GMAIL\_VERIFICATION\_SUCCESS\_REDIRECT. |
| :---- |

## **6.2  Flutter Mobile Application**

| 🔵  Use Staging for All Testing Use https://staging-api.airqo.net as your API base URL in your Flutter constants/config when testing this integration. |
| :---- |

OAuth flows require a real browser. Flutter cannot use **http** or **dio** directly for OAuth — it requires an in-app browser approach via the **flutter\_web\_auth\_2** package.

### **Installation**

| \# pubspec.yaml dependencies:   flutter\_web\_auth\_2: ^3.0.0   http: ^1.0.0   flutter\_secure\_storage: ^9.0.0  \# for storing the token after receipt |
| :---- |

### **Implementation**

| // lib/services/oauth\_service.dart import 'package:flutter\_web\_auth\_2/flutter\_web\_auth\_2.dart'; class OAuthService {   // Staging — use for all testing   static const \_apiBase \= 'https://staging-api.airqo.net';   // ⚠️  Replace 'airqo' with the agreed deep link scheme from Section 4   static const \_callbackScheme \= 'airqo';   static Future\<Map\<String, dynamic\>\> loginWithProvider(String provider) async {     try {       final authUrl \= '$\_apiBase/api/v2/users/auth/$provider?tenant=airqo';       // Opens a secure in-app browser (SFSafariViewController on iOS,       // Chrome Custom Tab on Android) and waits for the deep link redirect.       final result \= await FlutterWebAuth2.authenticate(         url: authUrl,         callbackUrlScheme: \_callbackScheme,       );       final uri \= Uri.parse(result);       // Check for failure deep link       if (uri.path.contains('failure')) {         return {'success': false, 'message': 'OAuth login cancelled or failed'};       }       // ⚠️  Token delivery method TBC — see Section 4 open question \#4.       // Option A (recommended): backend appends token to deep link.       // Extract like this if Option A is agreed:       // final token \= uri.queryParameters\['token'\];       return {'success': true};     } catch (e) {       return {'success': false, 'message': e.toString()};     }   } } |
| :---- |

| ⚠️  Critical: HttpOnly Cookie vs Flutter The backend sets the JWT as an HttpOnly cookie. This works for web browsers but Flutter's http/dio packages cannot access that cookie for subsequent API calls. Two options exist: Option A — Token in deep link (recommended): Backend appends the token as a query parameter: airqo://oauth/success?token=JWT\_VALUE. Flutter reads it from the URI. Requires a small change to the oauthCallback controller. Option B — Shared cookie jar: Use a persistent cookie store shared between the in-app browser and http/dio. More complex to implement consistently across iOS and Android. Flutter team must confirm their preferred option. Option A requires a backend code change. |
| :---- |

### **Deep Link Configuration**

| \<\!-- android/app/src/main/AndroidManifest.xml \--\> \<\!-- Add inside the \<activity\> tag \--\> \<intent-filter\>   \<action android:name="android.intent.action.VIEW" /\>   \<category android:name="android.intent.category.DEFAULT" /\>   \<category android:name="android.intent.category.BROWSABLE" /\>   \<\!-- ⚠️  Replace "airqo" with the confirmed scheme from Section 4 \--\>   \<data android:scheme="airqo" /\> \</intent-filter\> |
| :---- |

| \<\!-- ios/Runner/Info.plist \--\> \<key\>CFBundleURLTypes\</key\> \<array\>   \<dict\>     \<key\>CFBundleURLSchemes\</key\>     \<array\>       \<\!-- ⚠️  Replace airqo with the confirmed scheme from Section 4 \--\>       \<string\>airqo\</string\>     \</array\>   \</dict\> \</array\> |
| :---- |

| ⚠️  Frontend Input Needed Flutter team: Please confirm (1) the custom URI scheme for deep links, (2) the exact deep link paths for success and failure, and (3) whether Option A or Option B is preferred for token delivery. Option A requires a backend change to the oauthCallback controller. |
| :---- |

# **7\. Environment Reference**

|  | Staging  ← Use This | Production  ← Do Not Test |
| :---- | :---- | :---- |
| Backend Base URL | https://staging-api.airqo.net | https://api.airqo.net |
| Auth Initiation | /api/v2/users/auth/:provider | /api/v2/users/auth/:provider |
| OAuth Callback | /api/v2/users/auth/callback/:provider | /api/v2/users/auth/callback/:provider |
| Profile Endpoint | /api/v2/users/profile/enhanced | /api/v2/users/profile/enhanced |
| Success Redirect | ⚠️  TBC — see Section 4 | ⚠️  TBC — see Section 4 |
| Failure Redirect | https://staging-analytics.airqo.net/user/login | https://analytics.airqo.net/user/login |

# **8\. Quick Testing Guide**

| All tests should be run against staging: https://staging-api.airqo.net  — it carries the most recent backend changes. |
| :---- |

## **8.1  Google Login (Active — Test Now)**

### **Step 1 — Open in browser**

| \# Open this URL directly in your browser (Chrome, Firefox, Safari) https://staging-api.airqo.net/api/v2/users/auth/google?tenant=airqo |
| :---- |

Expected: Google consent screen loads → select your account → backend redirects to the configured success URL → **access\_token** cookie is visible in browser DevTools → Application → Cookies → staging-api.airqo.net.

### **Step 2 — Verify session with Postman or browser**

Copy the **access\_token** cookie value from DevTools and use it as the Authorization header:

| GET https://staging-api.airqo.net/api/v2/users/profile/enhanced Authorization: JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... |
| :---- |

Expected response: 200 with user profile including **google\_id** populated.

### **Step 3 — Test failure flow**

Visit the Google auth URL, then click **Cancel** on the consent screen. Expected: browser redirects to **https://staging-analytics.airqo.net/user/login**.

### **Step 4 — Test unsupported provider**

| \# Should return HTTP 400 https://staging-api.airqo.net/api/v2/users/auth/facebook |
| :---- |

## **8.2  Pending Providers (GitHub, LinkedIn, Microsoft, Twitter)**

These providers are implemented in the backend code but return a 400 until backend credentials are configured. Frontend teams do not need to take any action — when the backend team adds the credentials, the providers will activate automatically and the same test pattern from Section 8.1 applies.

| \# Currently returns 400: 'OAuth provider not configured: github' https://staging-api.airqo.net/api/v2/users/auth/github?tenant=airqo \# When credentials are added, the above will redirect to GitHub consent screen. \# No frontend code changes needed to enable these providers. |
| :---- |

# **9\. Open Questions — Action Required**

The following items must be resolved before social login is production-ready across both platforms.

| \# | Owner | Question | Why It Matters |
| :---- | :---- | :---- | :---- |
| 1 | Next.js | What is the exact success redirect path? (e.g. /dashboard, /home) | Backend cannot update GMAIL\_VERIFICATION\_SUCCESS\_REDIRECT without this |
| 2 | Next.js | Should ?success=provider be kept in the URL? | Affects backend redirect URL construction |
| 3 | Flutter | What custom URI scheme for deep links? (e.g. airqo://) | OAuth callback cannot return to the Flutter app without this |
| 4 | Flutter \+ Backend | Token delivery: Option A (token in URL) or Option B (shared cookie jar)? | Flutter cannot make authenticated API calls after login without resolving this |
| 5 | Flutter | Should web and mobile share the same success redirect URL? | One redirect URL likely cannot serve both platforms simultaneously |
| 6 | Backend | If Option A is chosen, oauthCallback controller must be updated to append a token to the deep link. | Blocking for Flutter OAuth |
| 7 | All teams | Which provider should be prioritised after Google? (GitHub, LinkedIn, Microsoft, Twitter) | Determines which credentials the backend team configures next |

# **10\. Security Considerations**

* The JWT is stored as an **HttpOnly** cookie. Frontend code must never attempt to replicate or manually set this cookie.

* **CSRF protection** is enabled on all OAuth 2.0 strategies via Passport's **state: true** option. Do not disable session middleware.

* All communication must use **HTTPS**. The Secure cookie attribute enforces this — HTTP requests will not carry the cookie.

* Provider names in **/auth/:provider** are validated against a whitelist. Unknown providers return 400 before any OAuth code runs.

* If a provider's credentials are missing, the strategy is not registered and the endpoint returns a clear 400 rather than a cryptic 500\.

* Email addresses from OAuth providers are normalized to lowercase before lookup and storage to prevent duplicate accounts.

* OAuth callback URLs are registered and validated server-side. Redirect URI manipulation results in a provider-level error.

AirQo Engineering  •  Makerere University, Kampala  •  airqo.net