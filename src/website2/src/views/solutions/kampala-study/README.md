# Kampala Air Quality Study Page

## Overview

This page presents the Kampala real-time air pollution exposure study with a modern, professional design encouraging citizen participation in air quality research.

## Page Location

- Route: `/solutions/kampala-study`
- Component: `src/views/solutions/kampala-study/KampalaStudyPage.tsx`
- Page: `src/app/solutions/kampala-study/page.tsx`
- Navigation: Added to Solutions dropdown in navbar

## Design Features

- **Modern Gradient Hero**: Eye-catching purple-pink gradient with overlay pattern
- **Clean White Background**: Professional and easy to read
- **Unique Color Scheme**: Indigo/purple/pink gradient (different from research page green)
- **Proper Spacing**: Generous padding and margins throughout
- **Responsive Design**: Fully responsive across all devices
- **Smooth Animations**: Framer Motion scroll animations
- **Professional Typography**: Clear hierarchy with proper font sizes

## Page Sections

### 1. Hero Section

- Gradient background with pattern overlay
- Large prominent heading
- Clear call-to-action button
- Badge indicator for "Join the Movement"

### 2. Why This Study Matters

- Large content card with rounded corners
- Gradient background for research objectives
- Checkmark icons for bullet points
- Professional spacing and typography

### 3. Benefits Section

- 4-column grid with gradient icon badges
- Hover effects on cards
- Color-coded gradients per benefit
- Clean shadow effects

### 4. Infographic Section

- Two-column split layout
- Unsplash image on right
- Gradient background (purple-pink-orange)
- Arrow bullets for list items

### 5. How to Participate

- 2-column grid on desktop
- Large numbered circles (01-04)
- No redundant icons - clean design
- Simple, clear instructions

### 6. Video Section

- Full-width responsive embed
- Proper 16:9 aspect ratio
- Large rounded corners
- Shadow effects

### 7. FAQ Section

- Large, spacious accordion items
- Proper padding (p-6 md:p-8)
- Hover effects on borders
- Chevron icons for expand/collapse
- Easy to read text size (text-lg md:text-xl)

### 8. Final CTA

- Matching gradient to hero
- Large centered button
- Prominent messaging

## Important: APK Link

⚠️ **ACTION REQUIRED**: Update the APK download link by searching for `'#'` in the file and replacing with actual APK URL.

Locations:

1. Hero section CTA button
2. "How to Participate" section button
3. Final CTA section button

## Colors Used

- **Primary Gradient**: `from-indigo-600 via-purple-600 to-pink-500`
- **Benefit Gradients**: Blue, Emerald, Purple, Orange (distinct colors)
- **Text**: Gray-900 for headings, Gray-600/700 for body
- **Backgrounds**: White and Gray-50 alternating

## Icons

Uses Lucide React icons:

- LuMapPin, LuActivity, LuLightbulb, LuTrendingUp (benefits)
- LuHeart (hero badge)
- LuDownload (CTA buttons)
- FiChevronDown/Up (FAQs)

## Metadata

SEO metadata configured in `src/lib/metadata.ts` with proper keywords and descriptions.
