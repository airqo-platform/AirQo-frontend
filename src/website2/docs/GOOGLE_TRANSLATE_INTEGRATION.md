# Google Translate Integration Documentation

## Overview

This document provides comprehensive guidance on setting up and integrating Google Translate functionality into the AirQo website. The integration enables users to translate the website content into multiple languages, enhancing accessibility and user experience for a global audience.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup Process](#setup-process)
3. [Configuration](#configuration)
4. [Component Integration](#component-integration)
5. [Language Management](#language-management)
6. [Translation Exclusions](#translation-exclusions)
7. [Privacy and Compliance](#privacy-and-compliance)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

## Prerequisites

- Next.js 14+ application
- React 18+
- TypeScript
- Tailwind CSS
- Google Translate API access (if using custom implementation)
- Basic understanding of React hooks and component lifecycle

## Setup Process

### 1. Google Translate Widget Setup

The integration uses Google's official Translate widget. To set it up:

1. **Add Google Translate Script**
   - Include the Google Translate script in your HTML head or layout component
   - The script should be loaded asynchronously to avoid blocking page load

2. **Initialize the Widget**
   - Use the `GoogleTranslate.tsx` component to handle widget initialization
   - Place it in your main layout or app component

### 2. Component Structure

Create the following components in your project:

```
src/components/
├── GoogleTranslate.tsx          # Main translate widget component
├── dialogs/
│   └── LanguageModal.tsx        # Language selection modal
└── utils/
    └── languages.ts             # Language configuration
```

### 3. Configuration Files

Update the following configuration files:

- `src/configs/mainConfigs.ts` - Add container classes if needed
- `src/utils/languages.ts` - Define supported languages
- `src/app/globals.css` - Add any custom styles for translate elements

## Configuration

### Language Configuration

The `languages.ts` file contains the list of supported languages:

```typescript
export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  // ... more languages
];
```

### Google Translate Component

The `GoogleTranslate.tsx` component handles:

- Widget initialization
- Language detection
- Event handling
- UI rendering

Key features:

- Automatic language detection
- Custom styling integration
- Event callbacks for translation changes

### Language Modal

The `LanguageModal.tsx` component provides:

- Visual language selection interface
- "Powered By Google" branding
- Integration with translate widget
- Accessibility features

## Component Integration

### 1. Layout Integration

Add the Google Translate component to your main layout:

```tsx
// src/app/layout.tsx
import GoogleTranslate from '@/components/GoogleTranslate';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GoogleTranslate />
        {children}
      </body>
    </html>
  );
}
```

### 2. Modal Integration

Include the language modal in your app structure:

```tsx
// src/app/layout.tsx or main component
import LanguageModal from '@/components/dialogs/LanguageModal';

export default function App() {
  return (
    <>
      <LanguageModal />
      {/* Other components */}
    </>
  );
}
```

### 3. State Management

If using Redux or other state management:

```tsx
// Store slice for translate state
interface TranslateState {
  currentLanguage: string;
  isWidgetLoaded: boolean;
}

// Actions and reducers for language changes
```

## Language Management

### Supported Languages

The integration supports the following languages:

- English (US/UK)
- French
- Spanish
- Portuguese
- Arabic
- Chinese (Simplified)
- Russian
- German
- Italian
- Swedish
- Finnish
- And more as configured

### Language Detection

The widget automatically detects the user's browser language and offers translation accordingly.

### Custom Language Addition

To add a new language:

1. Update `languages.ts` with the new language object
2. Update `GoogleTranslate.tsx` included languages array
3. Test the integration

## Translation Exclusions

### Preventing Translation of Specific Content

Use the `notranslate` class to prevent Google Translate from translating specific elements:

```tsx
<div className="notranslate">
  <p>This content will not be translated</p>
</div>
```

### Dialog Exclusions

Critical UI elements like dialogs should be excluded from translation:

```tsx
<DialogContent className="notranslate">{/* Dialog content */}</DialogContent>
```

### Dynamic Content

For dynamic content that shouldn't be translated:

```tsx
const NonTranslatableComponent = () => (
  <div className="notranslate">{/* Content */}</div>
);
```

## Privacy and Compliance

### Privacy Policy Updates

Update your privacy policy to include Google Translate usage:

```markdown
## Google Translate Integration

This website uses Google Translate, a service provided by Google Inc. Google Translate may collect and use information in accordance with their Privacy Policy. We recommend reviewing Google's privacy practices before using the translation feature.
```

### Cookie Consent

Ensure cookie consent covers Google Translate cookies:

- Google Translate may set cookies for language preferences
- Include in your cookie consent implementation
- Provide options to opt-out of non-essential cookies

### Data Collection

Be aware that Google Translate may collect:

- IP addresses
- Language preferences
- Usage analytics
- Translated content (for service improvement)

## Testing

### Manual Testing

1. **Language Selection**
   - Test language dropdown functionality
   - Verify modal opens and closes correctly
   - Check "Powered By Google" branding

2. **Translation Functionality**
   - Test translation to different languages
   - Verify page reload behavior
   - Check content accuracy

3. **Exclusions**
   - Confirm notranslate elements remain untranslated
   - Test dialogs and forms

### Automated Testing

```typescript
// Example test for GoogleTranslate component
describe('GoogleTranslate', () => {
  it('should render translate widget', () => {
    render(<GoogleTranslate />);
    expect(screen.getByTestId('google-translate')).toBeInTheDocument();
  });
});
```

### Cross-Browser Testing

Test on:

- Chrome/Chromium
- Firefox
- Safari
- Edge
- Mobile browsers

## Troubleshooting

### Common Issues

1. **Widget Not Loading**
   - Check internet connection
   - Verify script loading
   - Check console for errors

2. **Translation Not Working**
   - Ensure supported language
   - Check for notranslate classes
   - Verify widget initialization

3. **Styling Issues**
   - Override Google Translate default styles
   - Use CSS specificity
   - Check for CSS conflicts

### Debug Mode

Enable debug logging:

```typescript
// In GoogleTranslate.tsx
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Google Translate initialized');
}
```

### Performance Issues

- Load translate script asynchronously
- Defer initialization until user interaction
- Monitor bundle size impact

## Best Practices

### Performance

1. **Lazy Loading**
   - Load Google Translate only when needed
   - Use dynamic imports for components

2. **Bundle Optimization**
   - Minimize impact on initial bundle size
   - Use tree shaking for unused features

### Accessibility

1. **Screen Readers**
   - Ensure translated content is accessible
   - Maintain semantic HTML structure

2. **Keyboard Navigation**
   - Make language selection keyboard accessible
   - Provide skip links if needed

### User Experience

1. **Clear Branding**
   - Always include "Powered By Google" attribution
   - Make translation options visible but not intrusive

2. **Fallback Content**
   - Provide fallback for unsupported languages
   - Handle translation failures gracefully

### Security

1. **Content Security Policy**
   - Allow Google Translate domains
   - Restrict inline scripts if possible

2. **Data Sanitization**
   - Sanitize any user inputs related to translation
   - Avoid exposing sensitive data to translate service

### Maintenance

1. **Regular Updates**
   - Monitor Google Translate API changes
   - Update language lists as needed
   - Review privacy policy annually

2. **Monitoring**
   - Track translation usage
   - Monitor for broken translations
   - Collect user feedback

## API Reference

### GoogleTranslate Component Props

```typescript
interface GoogleTranslateProps {
  includedLanguages?: string[];
  defaultLanguage?: string;
  onLanguageChange?: (language: string) => void;
}
```

### LanguageModal Props

```typescript
interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLanguageSelect: (language: string) => void;
}
```

## Conclusion

This Google Translate integration provides a robust, user-friendly way to make your website accessible to a global audience. By following this documentation, you can ensure proper setup, configuration, and maintenance of the translation functionality.

For additional support or questions, refer to the Google Translate documentation or contact the development team.
