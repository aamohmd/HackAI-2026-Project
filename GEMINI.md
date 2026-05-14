# Project Guidelines: HackAI 2026

## 1. Architecture: Feature-Sliced Design (FSD)

The frontend is organized into layers to ensure scalability and isolation.

- **`src/shared`**: Foundation building blocks (UI Kit, API client, utils). No business logic.
- **`src/features`**: Domain-specific modules (e.g., `auth`, `user-profile`, `settings`). Features must expose a public API via an `index.ts` file. Cross-feature imports are strictly forbidden.
- **`src/pages`**: Route entry points that compose Features and Widgets inside Layouts.
- **`src/components/layout`**: Global layout structures (Header, Sidebar).

## 2. Visual Standards: Mist & Sky Theme

We use a high-contrast "AI Workbench" aesthetic inspired by LangChain.

- **Theme**: Cool grays ("Mist") with vibrant blue accents ("Sky").
- **Typography**: Figtree (Sans-Serif) for all text.
- **Icons**: Phosphor Icons (Regular weight for UI, Bold for active states).
- **Layout**: Use the **Bento Box** grid system for data-heavy pages.
    - Components: `shared/ui/Bento/BentoGrid` and `shared/ui/Bento/BentoCard`.
    - Features: Subtle 1px borders, 0.5rem radius, and radial glow hover effects.

## 3. Development Workflow

- **Type Safety**: Verbatim module syntax is enabled. Use `import type` for type-only imports.
- **Performance**: Follow Vercel React Best Practices. Avoid waterfalls; use parallel fetching where possible.
- **Testing**: Follow TDD for new features. Ensure behavioral correctness before implementation.
