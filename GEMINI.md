# Project Guidelines: HackAI 2026

## 1. Architecture: Feature-Sliced Design (FSD)

The frontend is organized into layers to ensure scalability and isolation.

- **`src/shared`**: Foundation building blocks (UI Kit, API client, utils). No business logic.
- **`src/features`**: Domain-specific modules (e.g., `auth`, `user-profile`, `settings`). Features must expose a public API via an `index.ts` file. Cross-feature imports are strictly forbidden.
- **`src/pages`**: Route entry points that compose Features and Widgets inside Layouts.
- **`src/components/layout`**: Global layout structures (Header, Sidebar).

## 2. Visual Standards: Dossier & Seal Theme

We use an "Official Legal" aesthetic inspired by classic Moroccan administrative dossiers.

- **Theme**: Parchment backgrounds (`#FDFBF7`), Midnight Navy text (`#1E293B`), and Wax Red accents (`#9A3412`).
- **Typography**: 
    - **Headings/Serif**: Crimson Text (for an authoritative, legal look).
    - **Body/Sans**: Figtree (for modern legibility).
- **Icons**: Phosphor Icons (Regular weight). Prefer `Gavel`, `Scroll`, `User`, `MapTrifold`.
- **Layout**: Use the **Dossier System**.
    - Components: `shared/ui/Dossier/DossierCard` and `shared/ui/Dossier/RubberStamp`.
    - Style: 2px borders, 0.25rem radius, and "Motabaq" (Verified) rubber stamps for completed sections.

## 4. Mobile Application (Expo)

The mobile app is located in the `mobile/` directory and mirrors the "Sidi El Qadi" experience.

- **Stack**: Expo, React Native, NativeWind (Tailwind for Native), Expo SecureStore (Auth).
- **Voice Intake**: Uses `expo-av` for robust native recording.
- **Styling**: Adheres to the same "Dossier & Seal" visual standards as the web.
- **Getting Started**:
    1. `cd mobile`
    2. `npm install`
    3. `npx expo start`
