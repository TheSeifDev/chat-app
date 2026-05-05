# Setup Guide

## Requirements

- Node.js (LTS recommended)
- npm or yarn
- Expo CLI (optional but recommended)
- Android/iOS emulator or Expo Go on a physical device

## Install

```bash
cd frontend
npm install
```

## Run

```bash
cd frontend
npx expo start
#or
npx expo start -c
```

To run on emulators/devices:

```bash
npx expo start -c
```

## Notes

- `main` points to `expo-router/entry`. Use `expo start` to run the router-aware dev server.
- If `react-native-reanimated` causes issues, follow the official install instructions (Babel plugin setup).
