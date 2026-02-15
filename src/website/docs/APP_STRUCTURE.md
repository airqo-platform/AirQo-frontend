# AirQo Website Application Structure

> **Last Updated:** February 13, 2026  
> **Version:** 2.0.0 - Multi-Section Architecture

## Overview

The AirQo website has been restructured to support multiple major sections while maintaining backward compatibility with all existing routes. The new architecture uses Next.js 14 App Router route groups to organize content logically and enable future scalability.

## Architecture Philosophy

The restructuring follows these key principles:

1. **Zero Breaking Changes** - All existing URLs remain unchanged
2. **Logical Grouping** - Related routes are grouped together using route groups
3. **Scalability** - New sections (packages, blog) sit at root level for growth
4. **Consistency** - Shared `MainLayout` ensures UI consistency across all sections
5. **SEO Preservation** - Sitemap and metadata maintained for all routes

## Directory Structure

```
src/app/
├── (main)/                    # Route group for main website content
│   ├── (about)/              # Nested route group for about-related pages
│   │   ├── about-us/
│   │   ├── careers/
│   │   ├── events/
│   │   ├── faqs/
│   │   ├── press/
│   │   └── resources/
│   ├── billboard/            # Air quality billboard displays
│   ├── clean-air-forum/      # Forum events and content
│   ├── contact/              # Contact forms
│   ├── explore-data/         # Data visualization
│   ├── home/                 # Homepage
│   ├── legal/                # Legal pages
│   ├── partners/             # Partner pages
│   ├── products/             # Product showcase
│   │   ├── analytics/
│   │   ├── api/
│   │   ├── calibrate/
│   │   ├── mobile-app/
│   │   └── monitor/
│   └── solutions/            # Solution pages
│       ├── african-cities/
│       ├── communities/
│       ├── kampala-study/
│       ├── network-coverage/
│       └── research/
├── packages/                  # Developer packages showcase (NEW)
│   ├── icons/                # Icons package detail page
│   ├── [packageName]/        # Dynamic route for future packages
│   ├── layout.tsx
│   └── page.tsx
├── blog/                      # Blog section (NEW)
│   ├── [slug]/               # Dynamic blog post routes
│   ├── layout.tsx
│   └── page.tsx
├── api/                       # API routes (unchanged)
├── layout.tsx                 # Root layout
├── page.tsx                   # Root redirector
├── sitemap.ts                 # Sitemap with new routes
└── ...other root files
```

## Route Groups Explained

### What are Route Groups?

Route groups are folders wrapped in parentheses `(name)` that organize routes **without affecting the URL path**. They're perfect for:
- Logical organization
- Applying different layouts to route sections
- Splitting large applications into manageable parts

### (main) Route Group

**Purpose:** Contains all existing main website content

**URL Impact:** None - routes in `(main)` are accessible at their original URLs
- `(main)/about-us/` → `airqo.net/about-us`
- `(main)/products/api/` → `airqo.net/products/api`
- `(main)/home/` → `airqo.net/home`

**Why use it?**
- Separates main content from new sections (packages, blog)
- Keeps existing routes organized
- Allows for section-specific configurations if needed in the future

### (about) Nested Route Group

**Purpose:** Groups about-related pages under `(main)`

**Location:** `(main)/(about)/`

**URL Impact:** None - nested route groups also don't affect URLs
- `(main)/(about)/careers/` → `airqo.net/careers`
- `(main)/(about)/events/` → `airqo.net/events`

**Benefits:**
- Logical grouping of related pages
- Shared layout across about pages
- Easier code navigation

## New Sections

### Packages Section

**Path:** `/packages/*`

**Purpose:** Showcase AirQo open source packages and developer tools

**Structure:**
```
packages/
├── layout.tsx              # MainLayout wrapper with packages metadata
├── page.tsx                # Landing page - all packages overview
├── icons/
│   └── page.tsx            # @airqo/icons-react package detail page
└── [packageName]/
    └── page.tsx            # Dynamic route for future packages
```

**Key Features:**
- Multi-package support with dynamic routes
- Framework badges (React, Vue, Flutter, TypeScript)
- Code examples with syntax highlighting
- Package metrics (downloads, stars, version)
- Links to npm, pub.dev, GitHub

**Configuration:**
- Types: `src/types/packages.ts`
- Config: `src/configs/packagesConfig.ts`
- Views: `src/views/packages/`
- Components: `src/components/packages/`

**URLs:**
- Landing: `/packages`
- Icons: `/packages/icons`
- Future: `/packages/[package-name]`

### Blog Section

**Path:** `/blog/*`

**Purpose:** News, insights, and stories (Coming Soon)

**Structure:**
```
blog/
├── layout.tsx              # MainLayout wrapper with blog metadata
├── page.tsx                # Coming soon page
└── [slug]/
    └── page.tsx            # Dynamic route for future blog posts
```

**Status:** Skeleton ready - awaiting content implementation

**URLs:**
- Landing: `/blog`
- Future posts: `/blog/[post-slug]`

## Layout Hierarchy

### Root Layout (`app/layout.tsx`)

**What it provides:**
- Font configuration (Inter variable)
- Global providers (Redux, SWR)
- Cookie consent, Google Translate, Google Analytics
- Engagement dialog, floating mini billboard

**Applies to:** All routes in the application

### MainLayout Component

**Location:** `src/components/layouts/MainLayout.tsx`

**What it provides:**
- Navbar
- Page transition animations
- Footer
- ActionButtons, Newsletter, Highlight sections

**Used by:** Almost all pages (main, packages, blog)

**Exceptions:**
- Contact pages (Navbar only, no footer)
- Partner pages (Navbar only)
- Forum pages (Custom layout with ForumDataProvider)

### Section Layouts

**packages/layout.tsx:**
- Wraps `MainLayout`
- Adds packages-specific metadata template
- Title template: `%s | AirQo Packages`

**blog/layout.tsx:**
- Wraps `MainLayout`
- Adds blog-specific metadata template
- Title template: `%s | AirQo Blog`

**(main)/(about)/layout.tsx:**
- Wraps `MainLayout`
- Adds "About AirQo" metadata template

## Views Pattern

The application follows a separation pattern:

```
src/app/[route]/page.tsx        → Thin page wrapper (metadata, exports)
         ↓
src/views/[route]/[Name]Page.tsx → Actual page component (logic, UI)
```

**Benefits:**
- Clean page files focused on Next.js configurations
- Reusable view components
- Easier testing
- Better code organization

**Examples:**
- `app/packages/page.tsx` → `views/packages/PackagesPage.tsx`
- `app/packages/icons/page.tsx` → `views/packages/IconsPackagePage.tsx`

## Navigation

### Navbar Updates

**New Menu Items:**

1. **Developers Dropdown**
   - Packages (open source libraries)
   - Air Quality API
   - Documentation
   - GitHub

2. **Blog Link** (direct link, no dropdown)

**Location:** `src/components/layouts/Navbar.tsx`

**Mobile Support:** Both desktop and mobile navigation updated

## Metadata & SEO

### Sitemap (`app/sitemap.ts`)

**New Entries:**
```typescript
{
  url: '/packages',
  priority: 0.8,
  changeFrequency: 'weekly'
},
{
  url: '/packages/icons',
  priority: 0.7,
  changeFrequency: 'weekly'
},
{
  url: '/blog',
  priority: 0.9,
  changeFrequency: 'daily'
}
```

### Metadata Configuration

Each section has comprehensive metadata:

**Packages:**
- Title template: `%s | AirQo Packages`
- Keywords: open source, developer tools, icons, React, Vue, Flutter
- OpenGraph images for social sharing

**Blog:**
- Title template: `%s | AirQo Blog`
- Keywords: air quality news, environmental monitoring, Africa
- Prepared for article-level metadata

## Adding New Content

### Adding a New Package

1. **Update config** (`src/configs/packagesConfig.ts`):
```typescript
{
  slug: 'new-package',
  name: '@airqo/new-package',
  tagline: 'Your tagline here',
  description: '...',
  frameworks: ['react', 'typescript'],
  status: 'stable',
  featured: true,
  links: { npm: '...', github: '...' },
  features: [...],
  installCommands: {...},
  usageExamples: {...}
}
```

2. **Dynamic route handles it automatically** via `[packageName]` route

3. **Optional:** Create dedicated page at `packages/new-package/page.tsx` for custom design

4. **Update sitemap** if needed for better SEO

### Adding Blog Posts

**When blog is ready:**

1. **Implement blog data source** (CMS, markdown files, API)

2. **Update** `blog/[slug]/page.tsx`:
   - Fetch posts in `generateStaticParams()`
   - Implement `generateMetadata()` with post data
   - Render post content in component

3. **Update** `blog/page.tsx`:
   - Replace "Coming Soon" with blog listing
   - Add pagination, categories, search

4. **Create blog views** in `src/views/blog/`:
   - `BlogListPage.tsx`
   - `BlogPostPage.tsx`
   - `BlogSidebar.tsx`, etc.

## Migration Notes

### What Changed

✅ **File Locations:**
- All main routes moved from `app/[route]` to `app/(main)/[route]`
- New sections added at `app/packages` and `app/blog`

✅ **URLs:**
- **No changes** - all URLs remain identical due to route groups

✅ **Navigation:**
- Added "Developers" dropdown with Packages
- Added "Blog" link

✅ **Sitemap:**
- Added `/packages`, `/packages/icons`, `/blog`

### What Didn't Change

- All page components remain functionally identical
- All existing routes accessible at same URLs
- Layout hierarchy preserved
- SEO and metadata strategy consistent
- View pattern unchanged

### Breaking Changes

**None** - This is a non-breaking refactor focused on organizational structure.

## Best Practices

### When to Use Route Groups

✅ **Good use cases:**
- Organizing related routes (`(main)`, `(about)`)
- Applying different layouts without URL changes
- Separating major application sections

❌ **Don't use when:**
- You actually want URL nesting
- Creating a single page
- Already have good organization

### Component Organization

**Follow this structure:**
```
src/
├── app/              # Next.js pages (thin wrappers)
├── views/            # Page components (main logic)
├── components/       # Reusable components
│   ├── layouts/      # Layout components
│   ├── sections/     # Section-specific components
│   ├── ui/           # Generic UI components
│   └── [feature]/    # Feature-specific components
├── types/            # TypeScript types
├── configs/          # Configuration files
└── utils/            # Utility functions
```

## Troubleshooting

### Routes not working after restructure

**Issue:** Getting 404 errors on existing routes

**Solution:**
- Clear Next.js cache: `rm -rf .next`
- Rebuild: `npm run build`
- Restart dev server: `npm run dev`

### Route groups showing in URLs

**Issue:** Seeing `(main)` or `(about)` in URLs

**Solution:**
- Route groups shouldn't appear in URLs
- Check for hardcoded links with group names
- Ensure using Link components correctly

### Packages not displaying

**Issue:** `/packages` page shows errors

**Solution:**
- Verify all package components are created
- Check imports in view files
- Ensure `packagesConfig.ts` is valid
- Review TypeScript types in `packages.ts`

### Navigation not updated

**Issue:** New menu items not showing

**Solution:**
- Check `Navbar.tsx` has `Developers` and `Blog` entries
- Clear browser cache
- Verify menuItems object structure

## Performance Considerations

### Static Generation

**All routes use static generation where possible:**
- Packages: Static at build time
- Blog: Will use ISR (Incremental Static Regeneration) when content added
- Main content: Mostly static with revalidation

### Bundle Optimization

- Route-based code splitting maintained
- Lazy loading for heavy components
- Tree-shaking enabled for package components

## Future Enhancements

### Planned Additions

- **Blog CMS Integration:** Connect to headless CMS for blog content
- **Package Metrics API:** Live data from npm/pub.dev
- **Interactive Package Playground:** Live code editing for packages
- **More Sections:** Documentation portal, community forum, etc.

### Scalability

The new structure supports:
- Unlimited packages via dynamic routes
- Unlimited blog posts via dynamic routes
- Additional major sections at app root level
- Sub-sections within existing areas

## References

- [Next.js Route Groups Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [AirQo SEO Guide](./AIRQO_SEO_GUIDE.md)
- [Package Config Reference](../src/configs/packagesConfig.ts)

## Support

For questions or issues with the new structure:
- Create an issue on the GitHub repository
- Contact the AirQo development team
- Review this documentation and related files

---

**Document Version:** 1.0  
**Created:** February 13, 2026  
**Author:** AirQo Development Team
