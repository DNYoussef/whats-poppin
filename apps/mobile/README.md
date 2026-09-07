# Native build spike

This separate Expo package is the required iOS/Android client foundation. Its only screen truthfully identifies this development build; event, auth, location, payment and matching features are not implemented here. The Next.js website remains at repository root.

Run npm ci --prefix apps/mobile from the repository root, then npm run typecheck --prefix apps/mobile and npm run bundle --prefix apps/mobile. Run node tests/mobile/check-boundary.mjs after root npm ci to prove the package boundary using temporary failing fixtures. Bundle output goes to a unique operating-system temporary directory, not the repository root.

The source template is expo-template-blank-typescript 57.0.22, created with create-expo-app 4.0.0. The lockfile pins Expo 57 and React Native 0.86 dependencies independently of the website. The root lockfile stays unchanged. No npm workspaces or shared business-code package is introduced.

Sources checked September 7, 2026:
- https://docs.expo.dev/versions/v57.0.0/ specifies Node 22.13.x minimum, React 19.2.3 / React Native 0.86, Android 7+ with SDK 36, iOS 16.4+ and Xcode 26.4+.
- https://docs.expo.dev/more/create-expo/ documents the minimal TypeScript template.
- https://docs.expo.dev/build-reference/local-builds/ documents that Windows is not supported for EAS local builds; use hosted Linux/macOS for native compilation.

CI currently verifies type isolation and JavaScript bundles only. It does not compile native binaries, run a simulator, or establish store eligibility. P00 still requires hosted native compilation and auth/location/purchase feasibility; P02/P09/P10 own functional, device and store-release evidence. Signing, app identifiers and store assets are deliberately unconfigured. No production API is called by this spike.
