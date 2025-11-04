# Mapbox Security Best Practices

## Token Security Overview

Mapbox access tokens are required for client-side map functionality. While the token appears in browser network requests, this is expected behavior for Mapbox's service.

## Security Measures Implemented

### 1. Environment Variable Usage

- Token is stored in `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` environment variable
- Never commit actual token values to version control
- Use `.env.local` for development and proper secret management for production

### 2. Token Restrictions (REQUIRED)

Configure the following restrictions in your Mapbox dashboard:

**URL Restrictions:**

- Add your production domain(s)
- Add `localhost:3000` for development
- Restrict to HTTPS only in production

**Scopes/Permissions:**

- `styles:read` - Read map styles
- `fonts:read` - Read fonts
- `tilesets:read` - Read tilesets
- Avoid write permissions unless absolutely necessary

### 3. Usage Monitoring

- Regularly monitor token usage in Mapbox dashboard
- Set up alerts for unusual activity
- Rotate tokens periodically

### 4. Additional Security Measures

- Use HTTPS everywhere
- Implement Content Security Policy headers
- Consider using Mapbox's enterprise features for enhanced security

## Implementation Notes

The token must be available client-side because:

- `react-map-gl` requires the token for map initialization
- Mapbox's client-side SDK needs the token for API calls
- This is standard practice for mapping services

## Risk Mitigation

While the token is visible in network requests, the implemented restrictions ensure:

- Token only works from authorized domains
- Limited permissions reduce damage potential
- Usage monitoring detects abuse
- Regular rotation limits exposure time

## Production Deployment

Before deploying to production:

1. Set URL restrictions in Mapbox dashboard
2. Verify token has minimal required permissions
3. Test map functionality
4. Monitor initial usage patterns
