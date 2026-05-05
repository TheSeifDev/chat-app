# Developer Guide

## Add a new screen

1. Create `app/<name>.tsx` (or place in a route group, e.g., `app/(main)/profile.tsx`).
2. Use `ScreenWrapper` for consistent background and paddings.
3. Import `useRouter` from `expo-router` to navigate (`push`, `replace`, `back`).
4. Keep business logic in hooks/services and UI in the screen component.

Example:

```tsx
import React from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";

export default function Profile() {
  return (
    <ScreenWrapper>
      <Typo size={24}>Profile</Typo>
    </ScreenWrapper>
  );
}
```

## Add a new component

1. Create a new file in `components/`.
2. Use tokens from `constants/theme.ts` and helpers from `utils/`.
3. Keep the component focused and presentational; accept props for customization.
4. Export default and import where needed.

## Coding conventions

- TypeScript-first: define prop types and extend `types.ts` when appropriate.
- Use centralized tokens in `constants/theme.ts` (no magic colors/spacings).
- Use `verticalScale` for responsive sizing.
- Avoid side effects in components; prefer hooks for data fetching and logic.
- Navigation patterns:
  - `router.replace` for transient redirects (splash, forced redirects).
  - `router.push` for forward navigation.
  - `router.back` for popping stack.
- Use `Button` `loading` prop for consistent loading UI.

## Recommended tooling

- ESLint and Prettier (project has ESLint configured)
- TypeScript checks (`tsc`) as part of CI
- Unit tests for hooks and services (Jest or Vitest)

---

If you want, I can scaffold a basic `docs/README.md` index, or create an `API` folder with a starter service and auth hook.
