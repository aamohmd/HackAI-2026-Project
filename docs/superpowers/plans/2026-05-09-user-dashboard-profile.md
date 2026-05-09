# User Dashboard & Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a functional and visually polished User Dashboard and Profile page with avatar uploads and optimistic UI updates.

**Architecture:** A modular approach using React Query for server state, shadcn/ui for components, and FastAPI for a secure backend. Avatars are stored on the local filesystem.

**Tech Stack:** React (TypeScript), Tailwind CSS, Phosphor Icons, React Query, FastAPI, SQLAlchemy, Pydantic.

---

### Task 1: Backend - Update User Model and Schemas

**Files:**
- Modify: `api/models.py`
- Modify: `api/schemas.py`
- Test: `api/tests/test_user_model.py` (Create)

- [ ] **Step 1: Write a test to verify new user fields**
```python
def test_user_profile_fields():
    user = User(email="test@example.com", full_name="John Doe", bio="Hello", avatar_url="/uploads/avatar.png")
    assert user.full_name == "John Doe"
    assert user.bio == "Hello"
    assert user.avatar_url == "/uploads/avatar.png"
```

- [ ] **Step 2: Update `api/models.py`**
Add `full_name`, `bio`, and `avatar_url` columns to the `User` class.

- [ ] **Step 3: Update `api/schemas.py`**
Add these fields to `UserBase`, `UserCreate`, and `UserResponse` Pydantic models. Ensure `full_name` and `bio` are optional.

- [ ] **Step 4: Run tests**
Expected: PASS.

---

### Task 2: Backend - Profile Update API

**Files:**
- Create: `api/routes/users.py`
- Modify: `api/main.py`
- Test: `api/tests/test_user_routes.py` (Create)

- [ ] **Step 1: Write a failing test for `PATCH /api/users/me`**
Verify that an authenticated user can update their `full_name` and `bio`.

- [ ] **Step 2: Implement the `PATCH /api/users/me` route**
Handle the update logic, ensuring only the provided fields are modified.

- [ ] **Step 3: Include the new router in `api/main.py`**
```python
from api.routes import users
app.include_router(users.router, prefix="/api/users", tags=["users"])
```

- [ ] **Step 4: Run tests**
Expected: PASS.

---

### Task 3: Backend - Avatar Upload Endpoint

**Files:**
- Modify: `api/routes/users.py`
- Test: `api/tests/test_avatar_upload.py` (Create)

- [ ] **Step 1: Write a test for `POST /api/users/me/avatar`**
Verify file size limits (2MB) and allowed types (JPG, PNG, SVG).

- [ ] **Step 2: Implement the avatar upload logic**
Save the file to an `uploads/` directory with a unique filename (e.g., UUID). Update the user's `avatar_url` in the database.

- [ ] **Step 3: Configure FastAPI to serve static files**
In `api/main.py`, mount the `uploads/` directory so avatars are accessible via URL.

---

### Task 4: Frontend - Dashboard Layout & Sidebar

**Files:**
- Create: `frontend/src/components/layout/DashboardLayout.tsx`
- Create: `frontend/src/components/layout/Sidebar.tsx`
- Create: `frontend/src/components/layout/Header.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Create `Sidebar.tsx`**
Implement the dark navigation sidebar using **Mist** colors and **Phosphor Icons** as per the mockup.

- [ ] **Step 2: Create `Header.tsx`**
Implement the white header showing the user's name and mini-avatar.

- [ ] **Step 3: Create `DashboardLayout.tsx`**
Combine Sidebar, Header, and an `<Outlet />` for nested routing.

- [ ] **Step 4: Update `App.tsx`**
Add a protected route group using the new `DashboardLayout`.

---

### Task 5: Frontend - Profile Page & Form

**Files:**
- Create: `frontend/src/pages/Profile.tsx`
- Create: `frontend/src/components/profile/ProfileForm.tsx`
- Create: `frontend/src/hooks/useProfile.ts`

- [ ] **Step 1: Implement `useProfile` hook**
Use `useQuery` and `useMutation` from `react-query` for fetching and updating profile data. Implement optimistic updates for the bio.

- [ ] **Step 2: Create `ProfileForm.tsx`**
Build the form using `react-hook-form` and `zod`. Match the visual style of the mockup (Figtree font, Sky blue buttons).

- [ ] **Step 3: Create `Profile.tsx`**
The main page container that renders the `ProfileForm`.

---

### Task 6: Frontend - Avatar Upload Component

**Files:**
- Create: `frontend/src/components/profile/AvatarUpload.tsx`

- [ ] **Step 1: Implement `AvatarUpload.tsx`**
Create the circular avatar preview with a "Change Avatar" button. Handle file selection and trigger the backend upload endpoint.

- [ ] **Step 2: Integrate into `Profile.tsx`**
Ensure the avatar updates in the header and profile page immediately after a successful upload.

---

### Task 7: Frontend - Dashboard Overview

**Files:**
- Create: `frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: Implement `Dashboard.tsx`**
Display the 3 stat cards from the mockup (Total Projects, Active Tasks, Completed) with placeholder data.
