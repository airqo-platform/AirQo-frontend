This local package is a temporary iOS simulator workaround.

Why it exists:
- The real `google_mlkit_translation` plugin pulls in native iOS code that
  blocked the app from building on the simulator.
- Our current focus is auth investigation, not on-device translation.

What it does:
- It mirrors the small API surface that the app currently imports.
- It returns the original text instead of performing real translation.
- It reports model checks/downloads as successful so simulator flows can
  continue without native MLKit.

Scope:
- This package is wired in through `pubspec_overrides.yaml`, so it is intended
  only as a local development workaround while investigating auth behavior.
