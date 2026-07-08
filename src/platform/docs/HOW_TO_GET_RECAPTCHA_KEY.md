# How to Get Google reCAPTCHA Keys

## Quick Start Guide

Follow these steps to get your reCAPTCHA site keys for the AirQo application.

---

## Step 1: Go to Google reCAPTCHA Admin Console

Visit: **[https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)**

You'll need a Google account. Sign in if you're not already logged in.

---

## Step 2: Register a New Site

Click the **"+"** button or **"Register a new site"** button.

### Fill in the Registration Form:

#### 1. **Label** (Required)

- Give your site a name
- Example: `AirQo Platform - Production` or `AirQo Platform - Development`
- This is just for your reference in the admin panel

#### 2. **reCAPTCHA type** (Required)

- Select: **"reCAPTCHA v2"**
- Then select: **"I'm not a robot" Checkbox**

✅ **Why v2 Checkbox?**

- User-friendly
- Clear visual confirmation
- Works well with forms
- Supported by our implementation

#### 3. **Domains** (Required)

**For Development:**

```
localhost
127.0.0.1
```

**For Production:**

```
yourdomain.com
www.yourdomain.com
```

**For Both (recommended during development):**

```
localhost
127.0.0.1
yourdomain.com
www.yourdomain.com
```

⚠️ **Important:**

- Add each domain on a new line
- Do NOT include `http://` or `https://`
- Do NOT include port numbers (`:3000`, etc.)
- Wildcards are NOT supported for subdomains in v2

#### 4. **Owners** (Optional)

- Add additional Google accounts that can manage this reCAPTCHA
- You can skip this if you're the only admin

#### 5. **Accept reCAPTCHA Terms of Service**

- ✅ Check the box
- Review terms if needed

---

## Step 3: Get Your Keys

After submitting, you'll see a page with your keys:

### Site Key (Public)

```
Example: 6LdXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

- This is **public** and will be visible in your frontend code
- Safe to expose in client-side JavaScript
- Used in your React components

### Secret Key (Private)

```
Example: 6LdYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
```

- This is **private** and should NEVER be exposed
- Only use on your server/backend
- Used for server-side verification

---

## Step 4: Add Keys to Your Application

### For Development (.env.local)

Create or edit `.env.local` in your project root:

```bash
# Google reCAPTCHA Keys (v2 - "I'm not a robot")
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LdXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
RECAPTCHA_SECRET_KEY=6LdYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
```

### For Production

Add these to your hosting environment variables:

**Vercel:**

1. Go to Project Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` = your site key
   - `RECAPTCHA_SECRET_KEY` = your secret key
3. Select "Production" environment

**Other platforms:**

- Follow your platform's documentation for setting environment variables
- Both keys are required
- Restart your application after adding

---

## Step 5: Restart Your Development Server

After adding the keys to `.env.local`:

```bash
# Stop your current server (Ctrl+C)
# Then restart:
yarn dev
```

---

## Verification Checklist

✅ **Test the reCAPTCHA Widget:**

1. Navigate to Billing Info tab
2. Click "Update" on payment method
3. You should see the "I'm not a robot" checkbox
4. Complete the challenge
5. Submit the form

✅ **Verify in Browser Console:**

- Open Developer Tools (F12)
- Should see no reCAPTCHA errors
- Look for successful verification

✅ **Check Server Logs:**

- Server should verify token successfully
- No "invalid site key" errors

---

## Common Issues & Solutions

### Issue 1: "Missing required parameters: sitekey"

**Cause:** Environment variable not set or app not restarted

**Solution:**

```bash
# 1. Check .env.local file exists and has the key
# 2. Restart dev server
yarn dev
```

### Issue 2: "Invalid site key"

**Cause:** Wrong key or domain not registered

**Solution:**

1. Check you copied the **Site Key** (not Secret Key)
2. Verify domain is registered in reCAPTCHA admin console
3. For localhost, ensure `localhost` is in domains list

### Issue 3: "Token validation failed"

**Cause:** Secret key wrong or not configured

**Solution:**

1. Check `RECAPTCHA_SECRET_KEY` is set correctly
2. Ensure it's the **Secret Key** (not Site Key)
3. Restart server after adding

### Issue 4: reCAPTCHA shows but verification fails

**Cause:** Domain mismatch

**Solution:**

1. Check the domain you're accessing matches registered domains
2. For development: `localhost` must be in domain list
3. For production: actual domain must be registered

---

## Testing in Different Environments

### Local Development

```bash
# .env.local
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_dev_site_key
RECAPTCHA_SECRET_KEY=your_dev_secret_key
```

**Domains to register:** `localhost`, `127.0.0.1`

### Staging

```bash
# .env.staging
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_staging_site_key
RECAPTCHA_SECRET_KEY=your_staging_secret_key
```

**Domains to register:** `staging.yourdomain.com`

### Production

```bash
# .env.production
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_production_site_key
RECAPTCHA_SECRET_KEY=your_production_secret_key
```

**Domains to register:** `yourdomain.com`, `www.yourdomain.com`

---

## Security Best Practices

### ✅ DO:

- Keep secret key in environment variables
- Use different keys for development/production
- Monitor reCAPTCHA analytics in admin console
- Set up email alerts for suspicious activity

### ❌ DON'T:

- Commit keys to Git/GitHub
- Share secret key publicly
- Use production keys in development
- Hardcode keys in source code

---

## Managing Your reCAPTCHA Keys

### View/Edit Settings:

1. Go to [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click on your site label
3. You can:
   - View keys (site key visible, secret key hidden)
   - Add/remove domains
   - View analytics
   - Delete site registration

### Analytics:

- Monitor verification requests
- Track success/failure rates
- Identify potential bot attacks
- View geographic distribution

### Regenerate Keys (if compromised):

1. Go to reCAPTCHA admin
2. Click settings for your site
3. Consider creating a new site instead (safer)
4. Update environment variables
5. Deploy new keys

---

## Quick Reference

| Environment Variable             | Type       | Where to Use       | Visible?        |
| -------------------------------- | ---------- | ------------------ | --------------- |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Site Key   | Frontend (browser) | ✅ Yes (public) |
| `RECAPTCHA_SECRET_KEY`           | Secret Key | Backend (server)   | ❌ No (private) |

---

## Additional Resources

- **Official Documentation:** https://developers.google.com/recaptcha/docs/display
- **reCAPTCHA Admin:** https://www.google.com/recaptcha/admin
- **Best Practices:** https://developers.google.com/recaptcha/docs/faq
- **Project Documentation:** See [RECAPTCHA_SECURITY.md](./RECAPTCHA_SECURITY.md)

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify environment variables are loaded (`console.log(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY)`)
3. Review server logs for verification errors
4. Check reCAPTCHA admin console for domain issues
5. Ensure you're using reCAPTCHA v2 (not v3)

---

**Last Updated:** December 12, 2025
**Version:** 1.0
