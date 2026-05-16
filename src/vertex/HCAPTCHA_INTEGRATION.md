# hCaptcha Foundation Integration

This document describes the hCaptcha integration for bot protection in the AirQo frontend application.

## Overview

The hCaptcha Foundation integration provides invisible bot protection for authentication flows and other sensitive operations. It uses hCaptcha's invisible widget to verify users are human without interrupting the user experience.

## Features

- **Invisible Verification**: No user interaction required for most legitimate users
- **Server-side Verification**: Tokens are verified on the server to prevent bypass
- **Graceful Degradation**: Application continues to work if hCaptcha is disabled or unavailable
- **Type-safe**: Full TypeScript support with proper type definitions
- **Logging Integration**: Integrated with application logging for monitoring

## Configuration

### Environment Variables

Add the following to your `.env.local` file:

```bash
# hCaptcha Configuration
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your_hcaptcha_site_key
HCAPTCHA_SECRET_KEY=your_hcaptcha_secret_key
NEXT_PUBLIC_HCAPTCHA_ENABLED=true
```

### Getting hCaptcha Keys

1. Visit [hCaptcha.com](https://www.hcaptcha.com/)
2. Create an account or sign in
3. Add a new site to get your site key and secret key
4. Choose "Invisible" as the site type for best user experience

## Components

### HCaptchaProvider

Wraps the application to load hCaptcha script and provide context.

```tsx
import { HCaptchaProvider } from '@/components/hcaptcha/HCaptchaProvider';

export default function App({ children }) {
  return (
    <HCaptchaProvider siteKey="your-site-key" enabled={true}>
      {children}
    </HCaptchaProvider>
  );
}
```

### InvisibleHCaptcha

Renders an invisible hCaptcha widget for form protection.

```tsx
import InvisibleHCaptcha from '@/components/hcaptcha/InvisibleHCaptcha';

function MyForm() {
  return (
    <InvisibleHCaptcha
      siteKey="your-site-key"
      onVerify={(token) => console.log('Verified:', token)}
      onError={(error) => console.error('Error:', error)}
    >
      {/* Your form content */}
    </InvisibleHCaptcha>
  );
}
```

### useHCaptchaForm Hook

React hook for integrating hCaptcha with forms.

```tsx
import { useHCaptchaForm } from '@/hooks/useHCaptchaForm';

function LoginForm() {
  const handleVerifySuccess = async (token: string) => {
    // Proceed with form submission
    await submitForm(token);
  };

  const { execute, isVerifying, error } = useHCaptchaForm(
    handleVerifySuccess,
    true // enabled
  );

  const handleSubmit = () => {
    execute(); // Triggers hCaptcha verification
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit">Submit</button>
    </form>
  );
}
```

## API Routes

### POST /api/hcaptcha/verify

Verifies hCaptcha token server-side.

**Request:**
```json
{
  "token": "hCaptcha response token",
  "remoteIp": "optional-client-ip"
}
```

**Response:**
```json
{
  "success": true
}
```

### POST /api/auth/login

Extended login endpoint with hCaptcha verification.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password",
  "hCaptchaToken": "optional-token"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": { "email": "user@example.com" }
}
```

**Response (hCaptcha Required):**
```json
{
  "error": "hCaptcha verification required",
  "code": "HCAPTCHA_REQUIRED"
}
```

## Testing

### Development Mode

To test without hCaptcha interfering:

1. Set `NEXT_PUBLIC_HCAPTCHA_ENABLED=false` in `.env.local`
2. The application will skip hCaptcha verification
3. Use test site keys from hCaptcha for development

### Test Keys

hCaptcha provides test keys:
- **Site Key**: `10000000-ffff-ffff-ffff-000000000001`
- **Secret Key**: `ER_xU3z2_6-_yF3gT8q_5H3r3_6K7m8n9p0q1r2s3t4u5v6w7x8y9z0`

## Troubleshooting

### Common Issues

**"hCaptcha verification failed"**
- Check that site key and secret key are correct
- Verify the token hasn't expired (tokens are single-use)
- Check server logs for specific error codes

**"hCaptcha script failed to load"**
- Check network connectivity
- Verify hCaptcha is not blocked by ad blockers
- Check browser console for specific errors

**"Missing secret key"**
- Ensure `HCAPTCHA_SECRET_KEY` is set in environment variables
- For serverless deployments, verify env vars are available at runtime

### Error Codes

- `missing-input-secret`: No secret key provided
- `invalid-input-secret`: Invalid secret key
- `missing-input-response`: No hCaptcha token provided
- `invalid-input-response`: Invalid or expired token
- `bad-request`: Malformed request
- `timeout-or-duplicate`: Token already used or expired

## Security Considerations

1. **Never expose secret key**: The `HCAPTCHA_SECRET_KEY` must only be used server-side
2. **Verify on server**: Always verify tokens server-side, not just client-side
3. **Use HTTPS**: hCaptcha requires HTTPS in production
4. **Rate limiting**: Implement rate limiting on authentication endpoints
5. **Monitor failures**: Log and monitor hCaptcha failures for potential attacks

## Performance

- hCaptcha script is loaded asynchronously and doesn't block page rendering
- Invisible widget has minimal performance impact
- Verification adds ~100-300ms to authentication flows
- Consider caching verification results for short periods if needed

## Support

For hCaptcha-specific issues, refer to:
- [hCaptcha Documentation](https://docs.hcaptcha.com/)
- [hCaptcha Support](https://www.hcaptcha.com/support)
