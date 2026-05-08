# Secondary Features Modular Implementation Plan

This document outlines the modular implementation of ubiquitous secondary features for the full-stack boilerplate. Because these features are modular, they can be implemented independently or delegated to different developers.

## 🚨 Global Engineering Rules (Non-Negotiable)
Before touching any module, the implementer **MUST** abide by the following:
1. **Git Standards:** You must strictly follow the rules laid out in `conductor/git-standards.md`. This includes using atomic commits, adhering to the commit message format, and maintaining clean branch histories.
2. **Frontend Guidelines:** You must strictly follow `conductor/frontGuidelines.md`. All UI components must be fully responsive, adhere to the established design system, and prioritize accessibility (a11y).

---

## Module 1: Admin & Role-Based Access Control (RBAC)
**Description:** Establish system roles (e.g., Admin, User) to restrict access to sensitive data and routes.
**Best Practice Tech Suggestion:** Route-level Middleware (Next.js), CASL for granular permissions.

**Implementation Checklist:**
- [ ] Update Database Schema to include `role` or `permissions` on the User model.
- [ ] Create robust server-side middleware to protect `/admin` routes.
- [ ] Build a barebones Admin Dashboard layout (sidebar, stats overview).
- [ ] Implement user-management table (view all users, ban/delete).

**Things to Keep in Mind:**
- **Security:** Never rely solely on client-side rendering (e.g., hiding a button) for security. Always verify the role on the backend before returning data or executing a mutation.

---

## Module 2: User Dashboard & Profile
**Description:** The primary landing zone for an authenticated user to view their stats, manage their data, and update their avatar/bio.
**Best Practice Tech Suggestion:** React Hook Form for profile editing, Zod for validation, S3/UploadThing for avatar uploads.

**Implementation Checklist:**
- [ ] Build the Dashboard layout structure (Sidebar/Header).
- [ ] Create a "Profile" page with an editable form (Name, Bio).
- [ ] Implement an avatar image upload component.
- [ ] Securely handle form submissions and database updates.

**Things to Keep in Mind:**
- **UX:** Provide immediate optimistic UI updates when a user changes their profile information.
- **Security:** Sanitize text inputs and restrict file upload types/sizes to prevent malicious payloads.

---

## Module 3: User Preferences & Settings
**Description:** Global user settings such as Dark/Light theme, Language/Locale, and Account Deletion.
**Best Practice Tech Suggestion:** `next-themes` for dark mode, local storage for guest preferences, DB for authenticated user preferences.

**Implementation Checklist:**
- [ ] Integrate a Theme Toggle (Dark / Light / System).
- [ ] Create a "Settings" page containing Preference toggles (e.g., email opt-in/out).
- [ ] Create a secure "Danger Zone" (Account deletion, password reset).
- [ ] Sync preferences between local storage and the database on login.

**Things to Keep in Mind:**
- **Accessibility:** Ensure high contrast in both Light and Dark modes. Follow the `frontGuidelines.md` for interactive toggles.

---

## Module 4: Notification System
**Description:** Alert users to important events via an in-app bell dropdown and transactional emails.
**Best Practice Tech Suggestion:** Pusher or Socket.io for real-time in-app alerts; Resend or SendGrid for transactional emails.

**Implementation Checklist:**
- [ ] Create a `Notifications` table in the database (`id`, `user_id`, `type`, `content`, `read_status`).
- [ ] Build an in-app Bell icon component with an unread badge.
- [ ] Build a dropdown/popover to list recent notifications.
- [ ] Implement backend utility functions to dispatch notifications (In-app + Email simultaneously).

**Things to Keep in Mind:**
- **Performance:** Do not poll the database constantly for notifications. Use WebSockets or Server-Sent Events (SSE), or fetch only on route changes.
- **UX:** Allow users to "Mark All as Read."

---

## Module 5: AI Chatbot / Support Widget
**Description:** A ubiquitous floating widget in the corner of the screen to help users navigate the site or answer FAQs.
**Best Practice Tech Suggestion:** Vercel AI SDK, OpenAI API, and Radix UI for accessible popovers.

**Implementation Checklist:**
- [ ] Build the floating chat toggle button and chat window UI.
- [ ] Create an API route to handle AI chat streaming responses.
- [ ] Inject website context (FAQs, navigation map) into the AI system prompt.
- [ ] (Optional) Save chat history to local storage so it persists across page reloads.

**Things to Keep in Mind:**
- **Cost Control:** Implement strict rate-limiting on the chatbot API route to prevent abuse and high API bills.
- **Context:** Ensure the chatbot clearly states it is an AI and provides a fallback to a real human (e.g., a "Contact Support" button).

---

## Module 6: Content Management System (CMS) Basics
**Description:** Simple markdown or rich-text driven pages for Blogs, Changelogs, or Legal pages (Privacy Policy, TOS).
**Best Practice Tech Suggestion:** MDX for local markdown files, or a headless CMS like Sanity/Contentful for non-technical authors.

**Implementation Checklist:**
- [ ] Decide on local MDX vs Headless CMS (Developer choice).
- [ ] Create dynamic routes (e.g., `/blog/[slug]`) to render content.
- [ ] Build a standard typography layout for reading long-form content.

**Things to Keep in Mind:**
- **SEO:** Ensure meta tags, canonical URLs, and OpenGraph images are dynamically generated for each post.

---

## Module 7: Analytics & Telemetry (Suggested Addition)
**Description:** Track page views, user engagement, and conversion metrics without invading privacy.
**Best Practice Tech Suggestion:** PostHog (for deep product analytics) or Vercel Web Analytics / Plausible (for lightweight, privacy-focused tracking).

**Implementation Checklist:**
- [ ] Create an analytics provider wrapper in the root layout.
- [ ] Configure tracking for page views.
- [ ] Expose a utility function to track custom events (e.g., `track('Signed Up')`).

**Things to Keep in Mind:**
- **Compliance:** Ensure your tracking respects GDPR/CCPA. Do not track personally identifiable information (PII) without explicit consent.

---

## Module 8: Feedback & Contact System (Suggested Addition)
**Description:** A simple, frictionless way for users to report bugs or request features.
**Best Practice Tech Suggestion:** A simple modal form tied to a Discord webhook, Slack webhook, or Resend email dispatch.

**Implementation Checklist:**
- [ ] Build a "Feedback" or "Report Bug" modal.
- [ ] Capture the user's current URL, browser metadata, and their message.
- [ ] Create an API route to dispatch the message to the team (Email/Slack).

**Things to Keep in Mind:**
- **Friction:** Make it as easy as possible to open. A keyboard shortcut (e.g., `Cmd + K` or `Cmd + ?`) can be very effective.
- **Spam:** Protect the submission endpoint with rate limiting or a lightweight CAPTCHA if it's public.
