# Folder Structure

This section explains each top-level folder and its responsibilities.

## `app/`

- Holds route components. Expo Router maps these files to navigation routes.
- Important files:
  - `app/_layout.tsx` — top-level `Stack` config.
  - `app/index.tsx` — splash screen (entry).
  - `app/(auth)/` — auth screens: `welcome.tsx`, `register.tsx`, `login.tsx`.
- Notes: Add nested `_layout.tsx` to provide feature-scoped navigation or guards.

## `components/`

- Presentational UI primitives used throughout the app.
- Key components:
  - `ScreenWrapper.tsx` — background and platform paddings.
  - `Typo.tsx` — responsive text wrapper.
  - `Input.tsx` — input with icon and focus behavior.
  - `Button.tsx` + `Loading.tsx` — consistent button and loader.
  - `BackButton.tsx` — wrapper for `router.back()`.
- Best practice: keep components pure/presentational and accept props.

## `constants/`

- Stores design tokens used project-wide.
- `theme.ts` contains colors, spacing, radii and other tokens.

## `utils/`

- Small helper functions and responsive math (e.g., `verticalScale`).
- Keeps layout math out of components.

## `assets/`

- Static images and icons (splashImage, bgPattern, default avatars, etc.).
- Consumed by `ScreenWrapper` and screens.
