# Spec: Responsive Sidebar with Mobile Drawer

## 1. Problem
On screens smaller than 768px (`md` breakpoint), the sidebar is hidden, leaving users with no way to navigate between pages (Dashboard, Profile, Settings) or logout.

## 2. Goals
- Provide full navigation accessibility on mobile devices.
- Maintain consistent styling between desktop and mobile.
- Use existing UI components (`Dialog`) where possible.

## 3. Architecture

### 3.1. Navigation Configuration
Extracted `navItems` to `src/config/navigation.ts` for single-source-of-truth.

### 3.2. Refactored Components
- **SidebarContent**: Pure UI component containing links and logout logic.
- **Sidebar**: Desktop-specific wrapper (visible on `md:flex`).
- **Header**: Updated to include a mobile menu toggle (visible on `md:hidden`).

### 3.3. UI Enhancements
- Enhanced `DialogContent` in `components/ui/dialog.tsx` with a `side="left"` variant to support slide-in drawer behavior.

## 4. Implementation Details
- Refactored `Sidebar.tsx` to use `SidebarContent`.
- Added `isMobileMenuOpen` state to `Header.tsx`.
- Implemented `Dialog` trigger with `List` (hamburger) icon in Header.

## 5. Verification
- Manual verification of component structure.
- Code follows existing `shadcn`-like patterns and Phosphor icon usage.
