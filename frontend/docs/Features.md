# Features

## Auth flow (UI)

- Splash (`app/index.tsx`) → Welcome → Register or Login.
- Forms use `Input` components and local refs for values.
- `handleSubmit` functions currently validate presence only and show an `Alert` (no network calls).

## UI system

- Reusable primitives: `ScreenWrapper`, `Typo`, `Input`, `Button`, `Loading`.
- Centralized tokens in `constants/theme.ts` ensure visual consistency.

## Navigation

- File-based routing via Expo Router.
- Top-level `Stack` from `app/_layout.tsx`.
- Route groups (e.g., `(auth)`) organize related screens and allow adding group-scoped layouts later.
