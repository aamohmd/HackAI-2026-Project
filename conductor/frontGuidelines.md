# Frontend Design Guidelines: Mist & Sky Theme

To ensure a consistent and professional look during the hackathon, please follow these visual standards. Our theme is based on the **"Mist"** base (cool grays) and **"Sky"** accent (vibrant blues), using **Figtree** for typography and **Phosphor Icons**.

## 1. Typography

*   **Font Family:** [Figtree](https://fonts.google.com/specimen/Figtree) (Geometric Sans-Serif).
*   **Usage:**
    *   Use `font-sans` for body text.
    *   Use `font-heading` (also Figtree) for titles and headers.
    *   **Weights:** 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold).

## 2. Color Palette

We use HSL variables defined in `index.css`. Always use the Tailwind utility classes to ensure theme compatibility (especially for Dark Mode).

*   **Primary (Sky):** `bg-primary`, `text-primary`. Use for main actions and highlights.
*   **Base (Mist):** `bg-background`, `text-foreground`. A cool, sophisticated gray scale.
*   **Secondary:** `bg-secondary`. Use for less prominent actions.
*   **Destructive:** `bg-destructive`. Use for dangerous actions (Delete, Remove).

## 3. Icons: Phosphor Icons

We use the [Phosphor Icons](https://phosphoricons.com/) library. It provides a cleaner, more modern look than standard icons.

*   **Usage:**
    ```tsx
    import { FlyingSaucer, User, SignOut } from "@phosphor-icons/react";

    // Standard size: 24 or 32
    <User size={24} weight="regular" />
    ```
*   **Weight:** Prefer `regular` for standard UI and `bold` for active states or headers.

## 4. Components: shadcn/ui

Always use existing components from `@/components/ui/` before building your own.

*   **Radius:** We use a **Medium (0.5rem)** border radius. It's already configured in `tailwind.config.js`.
*   **Shadows:** Use `shadow-sm` or `shadow-md`. Avoid heavy, dark shadows.

## 5. Coding Patterns

*   **Path Aliases:** Always use `@/` for imports (e.g., `@/components/ui/button`).
*   **Responsive Design:** Design mobile-first. Use `sm:`, `md:`, `lg:` prefixes for larger screens.
*   **Accessibility:** Ensure all interactive elements have proper `aria-labels` and keyboard focus states (shadcn handles most of this).

## 6. Development Mode

Run `make dev` to see your changes with Hot Module Replacement (HMR).
