# Limitations & Future Improvements

## Current limitations

- No backend/API client or endpoints
- Auth UI does not perform network authentication or token management
- No global state management (local state only)
- Basic validation (presence checks only) and no error handling strategy

## Risks as the app grows

- Data duplication and synchronization issues without a global store
- Security risks if token storage and lifecycle are not implemented correctly
- Performance and UX challenges when adding chat (real-time, message lists)

## Recommended next steps

- Add an API/service layer (axios or fetch wrapper) and typed models
- Implement global auth store and secure token persistence (`expo-secure-store`)
- Add form handling and validation (`react-hook-form` + `zod`/`yup`)
- Plan for real-time messaging (WebSocket or socket service) and message caching
- Introduce nested route layouts and route guards for authenticated areas
