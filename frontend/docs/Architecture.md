# Architecture

## Full app flow (step-by-step)

1. App start: Expo Router boots and renders the route mapped from `app/index.tsx`.
2. Splash (`app/index.tsx`) shows an animated logo and calls `router.replace('/(auth)/welcome')` after ~1.5s.
3. Welcome (`app/(auth)/welcome.tsx`) is a branded entry that `push`es the register screen on Get Started.
4. Register (`app/(auth)/register.tsx`) and Login (`app/(auth)/login.tsx`) are form screens that use `useRef`/`useState` for local inputs and `router.push`/`router.back` for navigation.

Notes: splash uses `replace` so it is not kept in navigation history.

---

## Expo Router & Navigation

- `app/` folder is the canonical route tree — file names map to routes.
- Parentheses in folder names (e.g., `(auth)`) create route groups for organization; they do not change paths.
- `app/_layout.tsx` provides the top-level `Stack` navigator with `headerShown: false`.
- Use nested `_layout.tsx` files to scope feature navigators later (e.g., main tabs vs auth stack).

### Router methods used

- `router.push(route)` — push a new route on the stack.
- `router.replace(route)` — swap the current route (no back entry).
- `router.back()` — pop the stack.

---

## Component architecture

- Screens: thin orchestration layers focused on layout, input wiring, and navigation.
- Components: presentational, single-responsibility building blocks.
  - `ScreenWrapper` — page scaffold and background pattern.
  - `Typo` — typography wrapper with responsive scaling.
  - `Input` — styled `TextInput` with icon and focus state.
  - `Button` — primary button with `loading` support.
- Visual tokens live in `constants/theme.ts` and responsive helpers live in `utils/styling.ts`.

---

## Data flow (current vs future)

- Current:
  - Local state only (screen-level `useState`, `useRef`).
  - No centralized data store or API service layer.

- Recommended future approach:
  - Add a typed API/service layer for network calls.
  - Introduce a global auth store (Context + reducer or Zustand) and secure token storage (expo-secure-store).
  - Encapsulate data fetching and side effects in hooks for testability and reuse.
