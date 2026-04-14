# AirQo SEO & Interactive Components Guide

**Last Updated**: January 28, 2026  
**Version**: 2.0

---

## Quick Overview

**Goal**: Drive 3x African traffic by Q2 2026, 25% return rate, 2min average engagement.

**Strategy**: Optimize existing interactive components (Billboard, Grid, Network Coverage) for search engines and engagement.

**Network**: 400+ monitors across 14 African countries (Uganda 171, Kenya 105, Nigeria 46, Ghana 12, Gambia 16, South Africa 17, Cameroon 19, Burundi 8, Ethiopia 6, Senegal 3, Zambia 2, Rwanda 1, Mozambique 1, DRC 1).

---

## What Was Completed ✅

### 1. Billboard Pages - Now Indexed

**Files**: `src/app/billboard/interactive/page.tsx`, `src/app/billboard/grid/[name]/page.tsx`

- ✅ Removed `noindex/nofollow` (were hidden from search engines)
- ✅ Added African-focused metadata with 14 keywords
- ✅ Title: "Live Air Quality Billboard Uganda, Kenya, Nigeria"
- ✅ Description mentions 16+ cities and all 14 countries

### 2. Network Coverage - Enhanced

**File**: `src/lib/metadata.ts` → `solutionsNetworkCoverage`

- ✅ Title: "400+ Air Quality Monitors Across 14 African Countries"
- ✅ Lists all countries with monitor counts
- ✅ 25 country-specific keywords

### 3. Sitemap Optimized

**File**: `src/app/sitemap.ts`

- ✅ Removed non-existent country/city page URLs
- ✅ Added `/billboard/interactive` (priority 0.95, hourly)
- ✅ Added `/solutions/network-coverage` (priority 0.95, daily)

### 4. Floating Mini Billboard ✅ NEW

**File**: `src/components/FloatingMiniBillboard.tsx`

- ✅ Uses **country admin level** grids with valid PM2.5 data only
- ✅ **Skips countries with no measurement data** automatically
- ✅ Rotates through countries with data every 10 seconds
- ✅ **Blue gradient background** (consistent branding)
- ✅ Uses @airqo/icons-react for air quality icons (color-coded)
- ✅ Shows PM2.5 values to **2 decimal places**
- ✅ Responsive: hidden on mobile (<768px), visible on md+ screens
- ✅ **Hidden on /billboard pages** to avoid duplication
- ✅ Clickable - redirects to `/solutions/african-cities#grids-section`
- ✅ Minimizable - shows "Country: XX.XX PM2.5" when minimized
- ✅ **Smart data filtering** - only displays locations with active readings
- ✅ Proper API caching to prevent server overload
- ✅ Uses existing air quality utils (no code duplication)

---

## Target Keywords by Country

### Uganda (171 monitors - 43%)

- "Kampala air quality live"
- "Uganda pollution monitor"
- "real-time air quality Uganda"

### Kenya (105 monitors - 26%)

- "Nairobi air quality display"
- "Kenya pollution monitoring"
- "Nairobi monitoring network"

### Nigeria (46 monitors)

- "Lagos air quality monitor"
- "Nigeria air pollution display"

### Ghana (12 monitors)

- "Accra air quality live"
- "Ghana pollution monitors"

### Long-Tail (Quick Wins)

- "how to check air quality in Kampala"
- "where are AirQo monitors located"
- "interactive air pollution billboard"

---

## Implementation Roadmap

### Phase 1: SEO Foundation ✅ COMPLETE

- [x] Enable indexing on billboard pages
- [x] Add comprehensive metadata
- [x] Update sitemap
- [x] Network coverage enhancement

### Phase 2: Internal Linking (Week 1)

- [ ] Homepage hero CTA to billboard
- [ ] Footer "Interactive Tools" section
- [ ] Explore-data visual cards
- [ ] Breadcrumbs on component pages

### Phase 3: Engagement Features (Week 2-3)

**Billboard:**

- [ ] City selector dropdown
- [ ] Auto-play with pause
- [ ] Historical comparison toggle
- [ ] Embed code generator

**Network Coverage:**

- [ ] Country filter dropdown
- [ ] Monitor detail panel
- [ ] Share map view button

**Grid Pages:**

- [ ] Side-by-side city comparison
- [ ] 24-hour replay animation

### Phase 4: Structured Data (Week 3)

```json
{
  "@type": "WebApplication",
  "name": "AirQo Live Air Quality Billboard",
  "applicationCategory": "EnvironmentalApplication",
  "offers": { "price": "0" }
}
```

### Phase 5: Content & Social (Week 4)

- [ ] Blog: "How to Check Air Quality in Kampala"
- [ ] Blog: "400+ Stations Across Africa"
- [ ] Daily social posts with billboard screenshots
- [ ] Email newsletter integration

### Phase 6: Analytics (Ongoing)

- [ ] GA4 custom events
- [ ] Engagement tracking dashboard
- [ ] Weekly Search Console review

---

## Expected Results (Q2 2026)

| Metric                      | Current | Target   |
| --------------------------- | ------- | -------- |
| Traffic (Interactive Tools) | ~500/mo | 6,500/mo |
| Avg Engagement Time         | 30s     | 2min     |
| Return Visitor Rate         | ~5%     | 25%      |
| Billboard Indexed           | ❌      | ✅ Done  |

---

## Quick Reference: Key Files

**Metadata**: `src/lib/metadata.ts`  
**Billboard Interactive**: `src/app/billboard/interactive/page.tsx`  
**Grid Billboard**: `src/app/billboard/grid/[name]/page.tsx`  
**Network Coverage**: `src/app/solutions/network-coverage/page.tsx`  
**Sitemap**: `src/app/sitemap.ts`  
**Root Layout**: `src/app/layout.tsx`

---

## Verification Steps

### Local Testing

```bash
npm run dev
# Visit: http://localhost:3000/billboard/interactive
# View Page Source → Check: <meta name="robots" content="index, follow">
```

### After Deployment

```bash
# Wait 3-7 days, then:
# Google: site:airqo.net/billboard/interactive
# Should return 1 result
```

---

## Priority Tasks This Week

1. **Homepage**: Add billboard CTA button
2. **Footer**: Add "Interactive Tools" section
3. **Explore Data**: Add visual navigation cards
4. **Analytics**: Set up GA4 event tracking

---

**Support**: For technical questions, check Next.js Metadata API docs.
