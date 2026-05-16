# Project Guidelines: HackAI 2026 (Mobile-First)

## 1. Architecture: Mobile-Native & API

The project is focused on a mobile-native experience via **Expo** and a robust **FastAPI** backend.

### Backend (Python/FastAPI)
- **CORS**: Configured to allow all origins (`*`) to support diverse mobile networking environments.
- **AI Stack**: Groq (Whisper for voice, Llama 3.3 for logic).
- **Auth**: Phone-based OTP.

### Mobile (Expo)
- **Location**: `mobile/` directory.
- **Stack**: Expo, React Native, NativeWind, Expo SecureStore.
- **Voice Intake**: Native `expo-av` recording.

## 2. Visual Standards: Dossier & Seal Theme

We use an "Official Legal" aesthetic inspired by classic Moroccan administrative dossiers.

- **Theme**: Parchment backgrounds (`#FDFBF7`), Midnight Navy text (`#1E293B`), and Wax Red accents (`#9A3412`).
- **Typography**: 
    - **Headings/Serif**: Crimson Text (for an authoritative, legal look).
    - **Body/Sans**: Figtree (for modern legibility).
- **Icons**: Phosphor Icons (Regular weight).
- **Layout**: The **Dossier System**.
    - Style: 2px borders, 0.25rem radius, and "Motabaq" (Verified) rubber stamps for completed sections.

## 3. Getting Started

1. **Start Backend**: `docker compose up -d db api`
2. **Start Mobile**:
    ```bash
    cd mobile
    npm install
    npx expo start
    ```
