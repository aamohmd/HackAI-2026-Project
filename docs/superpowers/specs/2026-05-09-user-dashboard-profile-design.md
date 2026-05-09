# User Dashboard & Profile Design Document

**Date:** 2026-05-09
**Status:** Draft
**Topic:** User Dashboard & Profile (Module 2)

## 1. Overview
This module provides a primary landing zone for authenticated users to view their stats, manage their personal data, and update their profile information (name, bio, and avatar). It adheres to the **Mist & Sky** design theme and the project's engineering standards.

## 2. Requirements

### 2.1 Functional Requirements
- **Dashboard Layout:** A persistent sidebar and header structure.
- **Profile Management:** Users can update their Full Name and Bio.
- **Avatar Upload:** Users can upload a profile picture (JPG, PNG, SVG; max 2MB).
- **Stat Cards:** Display placeholder stats (Total Projects, Active Tasks, Completed).
- **Read-only Email:** The email address is displayed but cannot be edited in this form.
- **Optimistic Updates:** UI reflects changes immediately while background synchronization occurs.

### 2.2 Visual Standards (Mist & Sky)
- **Typography:** Figtree (Sans-Serif).
- **Icons:** Phosphor Icons.
- **Colors:** Mist (HSL cool grays) for background/sidebar; Sky (HSL vibrant blue) for primary actions.
- **Components:** shadcn/ui base with 0.5rem (8px) border radius.
- **Spacing:** 4px-based scaling (p-6/p-8 for containers, space-y-6 for forms).

## 3. Architecture & Data Flow

### 3.1 Frontend
- **Framework:** React + TypeScript + Tailwind CSS.
- **State Management:** `react-query` for server state and caching.
- **Form Handling:** `react-hook-form` + `zod` for validation.
- **Components:**
  - `DashboardLayout`: Layout wrapper with `Sidebar` and `Header`.
  - `ProfilePage`: Main container for the profile form and avatar upload.
  - `AvatarUpload`: Component for file selection, preview, and upload.

### 3.2 Backend (FastAPI)
- **Model Updates:** Add `bio` (string) and `avatar_url` (string) to the `User` model.
- **API Endpoints:**
  - `GET /api/users/me`: Retrieve current user profile.
  - `PATCH /api/users/me`: Update profile data (name, bio).
  - `POST /api/users/me/avatar`: Upload and save avatar image to local filesystem.
- **Storage:** Local filesystem storage in an `uploads/` directory.

### 3.3 Security & UX
- **Sanitization:** Input sanitization for the Bio field.
- **Validation:** Server-side file type and size validation for uploads.
- **Feedback:** Toast notifications for success/error states.

## 4. Testing Strategy
- **Unit Tests:** Component-level tests for `ProfileForm` and `AvatarUpload`.
- **Integration Tests:** End-to-end flow for profile updates and file uploads.
- **Visual Regression:** Manual verification against the Mist & Sky guidelines.

## 5. Success Criteria
- User can successfully navigate to the Profile page.
- User can update their name and bio and see the changes persist after refresh.
- User can upload a new avatar and see it reflected in the header and profile page.
- The UI is fully responsive and adheres to the defined design system.
