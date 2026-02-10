# reCAPTCHA Configuration for Payment Security

## Overview

The billing and payment sections of the platform are protected with Google reCAPTCHA v2 to prevent automated attacks and ensure secure payment method updates.

## Environment Variables Required

Add these variables to your `.env.local` file:

```bash
# Google reCAPTCHA v2 Keys
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

## Getting reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click on the **+** button to register a new site
3. Fill in the form:
   - **Label**: AirQo Platform Payment Security
   - **reCAPTCHA type**: Select **reCAPTCHA v2** → **"I'm not a robot" Checkbox**
   - **Domains**: Add your domains
     - For development: `localhost`
     - For production: `your-production-domain.com`
   - Accept the reCAPTCHA Terms of Service
4. Click **Submit**
5. Copy the **Site Key** (public key) → Use for `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
6. Copy the **Secret Key** (private key) → Use for `RECAPTCHA_SECRET_KEY`

## Security Best Practices

### 1. Key Management

- ✅ **Never commit** secret keys to version control
- ✅ Store keys in environment variables only
- ✅ Use different keys for development and production
- ✅ Rotate keys regularly (every 6-12 months)

### 2. Client-Side Implementation

The reCAPTCHA widget is implemented in:

- **Location**: `src/modules/billing/components/PaymentMethodForm.tsx`
- **Type**: Checkbox ("I'm not a robot")
- **Theme**: Light (can be changed to dark)
- **Placement**: Above the submit button in payment form

```tsx
<ReCAPTCHA
  ref={recaptchaRef}
  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
  onChange={handleRecaptchaChange}
  theme="light"
/>
```

### 3. Server-Side Verification

The reCAPTCHA token is verified on the server:

- **Location**: `src/app/api/payments/update-card/route.ts`
- **Endpoint**: `POST /api/payments/update-card`
- **Verification**: Token validated with Google's API before processing payment

```typescript
// Verify reCAPTCHA with Google
const recaptchaResponse = await fetch(
  'https://www.google.com/recaptcha/api/siteverify',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${recaptchaSecret}&response=${recaptchaToken}`,
  }
);
```

### 4. Form Security Features

#### Card Validation

- **Luhn Algorithm**: Validates card number format
- **Expiry Validation**: Checks if card is not expired
- **CVV Format**: 3-4 digits only
- **Required Fields**: All fields must be filled

#### Data Protection

- 🔒 **HTTPS Only**: All payment data transmitted over secure connection
- 🔒 **No Storage**: Full card numbers never stored in database
- 🔒 **Tokenization**: Card details tokenized by payment provider
- 🔒 **Last 4 Only**: Only last 4 digits stored for display
- 🔒 **Session Auth**: User must be authenticated

#### Rate Limiting

Consider implementing rate limiting on the payment update endpoint:

```typescript
// Example with node-rate-limiter-flexible
const rateLimiter = new RateLimiterMemory({
  points: 3, // 3 attempts
  duration: 60 * 15, // per 15 minutes
});
```

## Testing

### Development Testing

1. Use reCAPTCHA test keys for automated testing:
   - **Site Key**: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
   - **Secret Key**: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`
   - These always validate successfully

### Manual Testing Checklist

- [ ] reCAPTCHA widget loads correctly
- [ ] Submit button disabled until reCAPTCHA completed
- [ ] Token sent with form submission
- [ ] Server validates token successfully
- [ ] Invalid token rejected with error message
- [ ] reCAPTCHA resets after failed submission
- [ ] Works in both light/dark themes
- [ ] Mobile responsive

## Error Handling

### Common Issues

#### 1. reCAPTCHA Widget Not Loading

**Cause**: Missing or invalid site key
**Solution**: Verify `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set correctly

#### 2. Verification Fails on Server

**Cause**: Missing or invalid secret key
**Solution**: Verify `RECAPTCHA_SECRET_KEY` is set correctly

#### 3. Domain Mismatch

**Cause**: Current domain not registered in reCAPTCHA console
**Solution**: Add domain to allowed domains list

#### 4. Network Errors

**Cause**: Cannot reach Google's verification API
**Solution**: Check firewall/proxy settings

## User Experience

### Visual Integration

The reCAPTCHA badge is styled to match the platform design:

- Centered below form fields
- Above action buttons
- Light theme for consistency
- Protected by reCAPTCHA badge shown at bottom

### Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatible
- Alternative audio challenge available

## Monitoring

### Metrics to Track

1. **reCAPTCHA Success Rate**: How many users complete it successfully
2. **Verification Failures**: Track suspicious patterns
3. **Form Abandonment**: Users who leave at reCAPTCHA step
4. **Response Time**: Time to verify token

### Logs to Monitor

```typescript
// Server-side logging
console.log('reCAPTCHA verification', {
  success: recaptchaData.success,
  score: recaptchaData.score, // For v3
  action: 'update_payment',
  timestamp: new Date().toISOString(),
});
```

## Migration to reCAPTCHA v3 (Optional)

For invisible protection without user interaction:

1. Register new v3 site in reCAPTCHA console
2. Update client-side to use `executeAsync()`
3. Server validates score (0.0 - 1.0)
4. Set threshold (e.g., score > 0.5 = human)

```typescript
// v3 example
const token = await recaptchaRef.current?.executeAsync();
```

## Support

For issues or questions:

- [reCAPTCHA Documentation](https://developers.google.com/recaptcha)
- [reCAPTCHA FAQ](https://developers.google.com/recaptcha/docs/faq)
- Platform team support

## Compliance

### GDPR

- Add reCAPTCHA to privacy policy
- Note data sent to Google
- Provide opt-out mechanism if required

### PCI DSS

- reCAPTCHA adds security layer
- Helps prevent card testing attacks
- Part of overall payment security strategy

## Related Files

- `src/modules/billing/components/PaymentMethodForm.tsx` - Client-side form
- `src/app/api/payments/update-card/route.ts` - Server-side verification
- `src/modules/billing/components/BillingInformation.tsx` - Parent component
- `.env.local` - Environment variables (not in repo)

---

**Last Updated**: December 12, 2025
**Version**: 1.0
