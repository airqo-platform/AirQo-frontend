# Changelog

All notable changes to the Vertex frontend will be documented in this file.

## [1.1.0] - 2026-05-16

### Added
- hCaptcha foundation integration for bot protection
- Reusable `HCaptchaWidget` component for form integration
- Environment variable configuration for hCaptcha site key

### Files Changed
- `package.json` - Added `@hcaptcha/react-hcaptcha` dependency
- `.env.example` - Added `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` variable
- `components/shared/captcha/HCaptchaWidget.tsx` - New reusable widget component

---