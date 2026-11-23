# AirQo shared design system

One place for the look of the AirQo dashboards (Beacon, Vertex, Nexus): the
design tokens, the Tailwind setup that reads them, and every component that two
or more of the apps draw the same way.

**Status: stage 1, gathering. Copies only.** No app imports from this folder yet,
and none of the apps' own files were changed or removed. Every file here
type-checks together in strict mode (111 files) against the packages installed
in Beacon and Vertex.

Vertex and `vertex-template` count as one app throughout, since the template is
generated from Vertex. Website and Moringa use a different token format (see
`theme/`) and only appear where they share a primitive.

## How "change the main" works

```
theme/tokens.css          the values: colours, radius, fonts (light and dark)
        │
theme/tailwind-preset.js  maps them to class names: bg-primary, text-muted-foreground, rounded-lg …
        │
ui/, kit/                 primitives built only from those class names
        │
layout/, auth/, page/, status/, feedback/, data-table/, tour/
                          app pieces built from the primitives
```

- **Build time:** change a value in `tokens.css` and every app using the preset
  picks it up.
- **Run time:** an organisation's saved theme (picked in Nexus) overrides
  `--primary`, `--ring` and the primary shades on `<html>` through
  `theme/theme-utils.ts`. Beacon, Vertex and Nexus already share these storage
  keys, so a change in Nexus shows up in the others.
- **What doesn't follow yet:** pieces with hard-coded colours (listed under
  "Doesn't follow the tokens yet" below) keep their colours whatever the tokens say.

## Folders

```
shared/
  theme/       tokens, base styles, Tailwind preset, font, per-organisation theme (6)
  lib/         cn()
  hooks/       use-toast
  styles/      loader.css: the conic spinner used by ui/loading-overlay
  ui/          shadcn primitives and loading states (38)
  kit/         the custom kit Vertex and Nexus share: dialog, button, input, select, toast (9)
  layout/      app shell: top bar, organisation switcher, sidebars, drawer, page frame (14)
  auth/        sign-in pieces (3)
  page/        banner, page heading, empty state, stat card, 404 page (6)
  status/      error pages, error boundary, offline banner, 403, auth error (11)
  feedback/    feedback form, satisfaction prompts, screenshot annotator (10)
  data-table/  the searchable, selectable table (8)
  tour/        product tour card and positioning (2)
```

## How the copies were made

- **`ui/`** files are straight copies of one app's file. The only edit is the
  import paths, which now point inside this folder.
- **Everything else** keeps the source app's markup and Tailwind classes as they
  were. Where the original read app state (Redux, group context, next-auth, nav
  config, app services), that value now comes in as a prop, so the same
  component works in any app. Each file's header comment names its source, the
  other apps' versions, and anything changed.
- **Which copy:** the version that uses the theme tokens rather than hard-coded
  colours, has the most complete API, or has the most callers. Each table below
  says which was picked.

## theme/: tokens and Tailwind

| File | What it is | Gathered from |
|---|---|---|
| `tokens.css` | Every CSS variable, light and dark | The three apps' `globals.css` |
| `base.css` | Element styles: headings, links, lists, code, scrollbars, `.text-*` helpers | Nexus and Vertex `globals.css` (same rules) |
| `tailwind-preset.js` | Maps the tokens to Tailwind names; radius, font, animations, plugins | The three `tailwind.config` files (same colour map) |
| `fonts.ts` | Inter via `next/font`, as `--font-inter` | Nexus and Vertex `app/layout.tsx` |
| `theme-utils.ts` | Read, save and apply an organisation's theme; the no-flash head script | Vertex `lib/theme-utils.ts` (Beacon's and Nexus's are the same file with less input checking) |
| `theme-provider.tsx` | `useTheme()`: mode, primary colour, setters, system-mode tracking | Vertex `components/theme-provider.tsx` |

The three dashboards already used the same variable names and the same RGB
triplet format (`--primary: 20 95 255`). Light mode was identical apart from two
values. Where they differed, `tokens.css` marks the value it uses and the
alternatives:

| Token | Beacon | Vertex | Nexus | Used here |
|---|---|---|---|---|
| light `--muted-foreground` | 100 116 139 | 91 105 124 | 100 116 139 | **Vertex.** Its 5.2:1 contrast on the page passes WCAG AA; the other value is 4.4:1 and fails for small text |
| light `--primary-50` | 239 246 255 | 235 245 255 | 239 246 255 | Beacon and Nexus |
| `--text`, `--heading` | maps both to `--foreground` | own values | own values | Vertex and Nexus |
| dark palette | neutral greys; cards one step lighter than the page | slate fills; cards the same colour as the page | slate fills; page painted 42 44 45, so cards are darker than the page | **Beacon** (the 2026-08 redesign). The Nexus/Vertex values are in a comment in `tokens.css` |
| sidebar tokens | yes | no | no | Beacon (also mapped in the preset now) |
| scrollbar tokens | no | yes | yes | Vertex and Nexus |
| element styles (`base.css`) | none (Tailwind reset only) | yes | yes | Vertex and Nexus |
| font | Inter by class name; `--font-inter` never set | `--font-inter` | `--font-inter` | `--font-inter` |
| `tailwindcss-animate` | enabled | installed but not enabled, so its shadcn animations do nothing | not installed | enabled when the app has it installed; skipped with a warning otherwise |

**What adopting the theme would change in each app:**
- **Beacon:**
  - Light-mode muted text gets slightly darker.
  - Headings, links and lists without their own classes pick up `base.css` styles.
  - `html` stops scrolling; its dashboard already scrolls `main`, but check the
    login and public pages.
- **Vertex:**
  - Dark mode becomes neutral grey, with raised cards.
  - Its shadcn open/close animations start working.
- **Nexus:**
  - Dark mode as for Vertex.
  - Muted text gets darker.
  - Needs `tailwindcss-animate` installed for the shadcn animations.

**Website and Moringa** use stock shadcn HSL tokens (`240 5.9% 10%`), and
Website's primary is near-black. They'd need their values converted to RGB
triplets before using the preset.

## ui/: shadcn primitives

Used by Beacon throughout, and by Vertex next to its own kit.

| Component | Copied from | Same in | Own, different copy in |
|---|---|---|---|
| button | Beacon | Vertex, Moringa | Website (smaller sizes, shadows) |
| input | Beacon | Vertex, Moringa | Website (h-9, text-sm) |
| checkbox | Beacon | Vertex | Moringa (hard-coded grays) |
| label | Beacon | Vertex | Moringa (no cva variants) |
| skeleton, textarea | Beacon | Vertex | Moringa |
| toaster | Beacon | Vertex | — |
| alert-dialog | Beacon | Vertex | — |
| alert, collapsible, progress, scroll-area, separator, table, form | Beacon | Vertex | — |
| tooltip | Beacon | — | Vertex (z-50 instead of z-[10001], so it hides behind dialogs) |
| sheet | Beacon | — | Vertex (z-[12000]) |
| chart | Beacon | — | Vertex (Recharts' own prop types; no `minWidth={0}` fix) |
| hover-card | Vertex | — | Beacon (no transform origin) |
| command | Vertex | — | Beacon (cursor-default, no hover colour; passes Beacon's dialog feedback prop) |
| card | Beacon | — | Vertex (gray borders), Nexus (border only in "bordered" theme style), Moringa and Website (`h3`/`p` parts, Website rounded-xl) |
| tabs | Beacon | — | Vertex (pill tabs), Moringa (hard-coded grays) |
| switch | Beacon | — | Vertex (`bg-muted` track, white thumb), Moringa (custom) |
| select | Beacon | — | Vertex (check on the right, z-[10000]), Moringa |
| popover | Beacon | — | Vertex (portals into an open dialog), Moringa |
| dropdown-menu | Beacon | — | Vertex (z-50), Website (Radix icons) |
| toast | Beacon | — | Vertex and Moringa (z-[100]) |
| avatar | Beacon | — | Vertex (no `bg-muted` fallback) |
| badge | Beacon | — | Vertex (no ref forwarding) |
| accordion | Beacon | — | Vertex (newer `data-slot` version), Website |
| dialog | Vertex | — | Beacon (adds a feedback button tied to its feedback module), Moringa, Website |
| calendar | Vertex | — | Beacon (drops className/props on the chevrons) |
| pagination | Beacon | — | Vertex (stock links-only version, unused), Nexus (in `data-table/`) |
| radio-group, toggle | Beacon | — | Beacon only, but used (3 and 1 files) |
| loading-overlay | Beacon | Nexus (z-index, card opacity) | Vertex `layout/loading/session-loading.tsx` (opaque white) |
| loading-spinner, loading-state | Beacon | Nexus | — |

**Not copied:** primitives installed in Beacon but imported nowhere:
- navigation-menu, slider, toggle-group, breadcrumb, drawer
- context-menu, menubar, input-otp, aspect-ratio, carousel
- resizable, sidebar
- sonner (unused in Vertex too)

## kit/: the Vertex and Nexus kit

Vertex (`components/shared/*`, the `Reusable*` components) and Nexus
(`shared/components/ui`) grew from the same original kit. Nexus's copies are the
base: they use the tokens where Vertex hard-codes white and grays, and have more
of the API. Vertex-only props were added as optional props.

| Piece | Copied from | Vertex | Nexus | Beacon | Drift |
|---|---|---|---|---|---|
| `button` | Nexus | `ReusableButton` (~60 files) | `ui/button` (~124) | `ui/button` | Same filled/outlined/text, `Icon`, `loading`, `path`. Nexus adds ghost, danger, sizes, `iconPosition`. Vertex renders `path` as `<a>`, Nexus uses `router.push` (kept) |
| `dialog` | Nexus | `ReusableDialog` (~37) | `ui/dialog` (~68) | `ui/dialog` | Same props, header and footer. Nexus portals to `<body>`, traps Tab, has loading actions. Added from Vertex: a dialog stack (Escape closes only the top one), xs and 4xl–7xl sizes, `zIndex`, feedback button, banner slot |
| `toast` | Nexus | `ReusableToast` | `ui/toast` (~90) | Radix `ui/toast` | Same Sonner API. Nexus: icon, pausable progress bar, role by severity. Vertex: coloured stripe. Vertex's legacy `ReusableToast({message,type})` is kept |
| `input` | Nexus | `ReusableInputField` (~26) | `ui/input` (~55) | `ui/input` | Same label, error, description. Nexus: character counter. From Vertex: copy and custom action buttons. Vertex always shows the password toggle; Nexus needs `showPasswordToggle` (kept) |
| `text-input` | Nexus | `as="textarea"` on the input | `ui/text-input` (~15) | `ui/textarea` | Nexus adds a leading icon, counter and resize limits |
| `select` | Nexus | `ReusableSelectInput` (~14) | `ui/select` (~32) | `ui/select` | Same `<option>` children. Nexus: portalled list, `searchable`, keyboard support. Vertex: inline list at z-50 |
| `search-field` | Nexus | inline per page | `ui/search-field` (~9) | inline per page | Also used by `select` and `data-table` |
| `card-wrapper` | Vertex | `CardWrapper` (4) | trimmed copy inside `ui/dialog` | — | Header, footer and side slots. Hard-coded `bg-white dark:bg-[#1d1f20]` kept |

Props that replace app state:
- **dialog:** `onFeedbackClick(context)` and `showFeedbackButton` replace Vertex's
  feedback import. `banner` replaces Vertex's banner context.
- **button:** `renderDisabled(button)` replaces Vertex's `permission` prop, which
  wrapped the button in its permission tooltip.

**Not copied (one app only):**
- Nexus: `wide-dialog`, `segmented-tabs` (21 files), `radio`, `button-dropdown`,
  `phone-input`, `password-requirements`.
- Vertex: `ReusableFileUpload`, `ui/combobox` (6), `ui/multi-select` (13),
  `ui/date-picker`.

**Nexus's card** (`ui/card`, ~93 files) is the shadcn card with `rounded-md`,
plus a border that only shows when the organisation's theme style is "bordered".
To merge it, `ui/card` would take a `bordered` prop.

## layout/: the app shell

Beacon, Vertex and Nexus draw the same shell. A rounded card bar runs across the
top: menu button, logo and app name, page title, then the organisation badge,
help, the app grid and the avatar. A collapsible card sidebar sits beside the
content, and a slide-over drawer holds the app-wide links. The code was written
three times, so line-by-line similarity is low, but the design is the same.
Beacon was built last by copying Nexus's classes, so its versions are usually
the base.

| Piece | Copied from | Beacon | Vertex | Nexus | Design |
|---|---|---|---|---|---|
| `top-bar` (+ `TopBarBrand`) | Beacon | `dashboard/top-nav.tsx` | `layout/topbar.tsx` | `header/index.tsx` | Same. Height differs: h-14, py-1, h-12. Vertex's is `fixed`; Nexus's can hide on scroll |
| `organisation-switcher` | Beacon | `dashboard/group-selector.tsx` | `features/org-picker/*` | `header/components/organization-selector.tsx` | Same badge and modal (search, Current/Member rows). Vertex lists only memberships |
| `profile-menu` | Beacon | in `top-nav.tsx` | in `topbar.tsx` | `header/components/profile-dropdown.tsx` | Same header, then Log out. Nexus adds "My profile", Vertex a dark mode toggle (pass as `children`) |
| `logout-dialog` | Beacon | in `top-nav.tsx` | in `topbar.tsx` | `header/components/logout-confirmation-dialog.tsx` | Same flow, three wordings and colours |
| `help-menu` | Beacon | in `top-nav.tsx` | button only | `header/components/info-dropdown.tsx` | Same button; items differ |
| `app-switcher` | Beacon | `dashboard/app-dropdown.tsx` | `layout/AppDropdown.tsx` | `header/components/app-dropdown.tsx` | Same component (78% identical code). Vertex shows a list instead of the grid |
| `app-drawer` | Beacon | `dashboard/primary-sidebar.tsx` | `layout/primary-sidebar.tsx` | `global-sidebar/index.tsx` | Same w-72 slide-over: logo, app name, organisation pill, Home, "Administrative Panel" and "Recently Visited" flyouts. Beacon's uses a Radix dialog (focus trap). Vertex's uses framer-motion at z-[999]. Nexus has the same chrome with its own links |
| `section-sidebar` | Beacon | `dashboard/sidebar.tsx` | `layout/secondary-sidebar.tsx` | `sidebar/index.tsx` + `SidebarContent.tsx` | Beacon and Nexus the same (256/64px, round collapse button, feedback card). Vertex built differently (fixed, 75px collapsed) |
| `nav-item` | Nexus | inline in `dashboard/sidebar.tsx` | `layout/NavItem.tsx` | `sidebar/components/nav-item.tsx` | Same markup (left active bar, `bg-primary/10`). Vertex hard-codes grays and has no sub-route popup |
| `dashboard-layout` | Beacon | `app/dashboard/layout.tsx` | `layout/layout.tsx` | `layouts/MainLayout.tsx` | Beacon and Nexus the same (`flex flex-col h-screen gap-2`, top bar, sidebar plus scrolling `main`). Vertex is fixed-positioned (`lg:ml-[256px]`). Nexus's skip link added |
| `organisation-switch-overlay` | Nexus | inline "Updating active group..." | top progress bar | `ui/group-switch-overlay.tsx` | Three treatments for the same moment |
| `navigation-progress` | Vertex | none | in `layout/layout.tsx` | none | The progress-bar alternative to the overlay |
| `sidebar-skeleton` | Nexus | none | none | `sidebar/components/SidebarSkeleton.tsx` | Nexus only; usable while access loads |
| `footer` | Vertex | none | `layout/Footer.tsx` | `ui/footer.tsx` | Identical except the product line |

Props that replace app state:
- **organisation-switcher:** `activeOrganisation`, `options`, `onSelect`,
  `onOpenChange`, `joinHref`, `renderJoinAction`.
- **section-sidebar and nav-item:** `sections` in Beacon's nav-config shape, with
  the route-matching helpers copied alongside. `nav-item` adds `badge`,
  `disabled`, `exact`, `endIcon` and `external`.
- **app-drawer:**
  - `appName`, `logo` and `activeOrganisation` for the header.
  - `items` for top-level links.
  - `menus` for the flyouts; a menu with no items is hidden.
  - `mobileSections` for module links below md.
- **dashboard-layout:**
  - Slots: `topBar`, `sidebar`, `drawer`, `subHeader`, `pageBanner`, `footer`,
    `belowContent`, `bottomNav`.
  - Options: `fullBleed` (map pages) and `contentWidth`.
  - Auth redirects and route guards stay in the app.
- **app-switcher:** `currentApp` hides the app you're in.

**Not copied:**
- **Nexus's phone navigation** (`bottom-navigation`, `secondary-navigation`,
  `mobile-sidebar`). The `bottomNav` and `subHeader` slots and the drawer's
  `mobileSections` cover the same needs.
- **Two Vertex headers:** the Electron title bar and the download page header.

## auth/: sign-in

Beacon's sign-in pieces are near-copies of Nexus's. Vertex has its own design:
social buttons first, "Continue with email", a sliding step change, hCaptcha.

| Piece | Copied from | Beacon | Vertex | Nexus | Design |
|---|---|---|---|---|---|
| `auth-layout` | Nexus | `auth/auth-layout.tsx` | inline in login page | `layouts/AuthLayout.tsx` | Beacon and Nexus identical (Nexus's `h-dvh` kept) |
| `selected-email-card` | Beacon | `auth/selected-email-card.tsx` | inline | `auth/SelectedEmailCard.tsx` | Same; Nexus hard-codes blue |
| `social-auth-section` | Beacon | `auth/social-auth-section.tsx` | `features/auth/social-auth-section.tsx` | `auth/SocialAuthSection.tsx` | Same 4-button grid and "Last used" badge in all three |

`social-auth-section` only draws the buttons. The app passes `lastUsedProvider`
and starts sign-in in `onProviderClick`. The two-step login page stays per app:
it is tied to each app's next-auth fields and redirects. Register and password
reset exist only in Nexus.

## page/: page-level pieces

| Piece | Copied from | Beacon | Vertex | Nexus | Design |
|---|---|---|---|---|---|
| `banner` | Vertex | none (uses `ui/alert`) | `ui/banner.tsx` | `ui/banner.tsx` | Same API and Success/Error/Warning/Info |
| `page-heading` | Nexus | inline, sizes vary | inline, same look | `ui/page-heading.tsx` | Vertex and Nexus close |
| `empty-state` | Nexus | inline | `ui/empty-state.tsx` | `ui/empty-state.tsx` | Same parts; `action` is any node |
| `stat-card` | Beacon | `dashboard/summary-card.tsx` (4 pages) | `features/dashboard/stat-card.tsx` (2) | `ui/metric-card.tsx` (11) | Same idea, three looks. Beacon's uses the tokens and has badge, secondary figure and progress bar. Vertex adds a description tooltip, sizes and an active ring; Nexus's is label, value and hint, no icon |
| `not-found-page` + `oops-icon` | Nexus | **none** | `app/not-found.tsx` | `app/not-found.tsx` | Vertex and Nexus identical apart from the support email |

## status/: errors, offline, access

| Piece | Copied from | Beacon | Vertex | Nexus | Design |
|---|---|---|---|---|---|
| `route-error` | Beacon | `route-error.tsx` (used by `error.tsx` and `global-error.tsx`) | plain block; big "Oops!" global page | card plus Oops icon, inline-styled global page | Beacon and Nexus close: bordered card, "Something went wrong", Try again. Only Beacon has the offline variant |
| `error-boundary` | Beacon | `error-boundary.tsx` | two: an unclosable dialog and an unstyled one | full-screen Oops | Different in all three; Beacon's has `fallback`, `onError` and an HOC |
| `error-state` | Nexus | inline | inline | `ui/error-state.tsx` | The error twin of `page/empty-state`; also used by `data-table` |
| `network-status-banner` | Beacon | `network-status-banner.tsx` | red/amber pill with dismiss | amber pill plus a full-screen outage overlay | Three designs; Beacon's covers offline, reconnecting and restored |
| `forbidden-page` | Vertex | none | `ui/forbidden-page.tsx` + `forbidden-error.tsx` | none | Full-page 403 |
| `access-denied` | Nexus | none | none | `AccessDenied.tsx` | In-page red banner; different from Vertex's 403 |
| `permission-tooltip` | Vertex | none | `ui/permission-tooltip.tsx` | none | The reason, the missing permissions and a docs link |
| `auth-error-page` + `auth-errors` | Beacon | `app/auth-error` (branch `claude/loving-wilbur-92b830`, not merged) | `app/auth-error/page.tsx` | none | Beacon's uses the shared auth card; Vertex's four extra error codes added |
| `maintenance-banner` | Nexus | none | none | `MaintenanceBanner.tsx` | Warning banner with a countdown, filtered by product |

Props that replace app state:
- **route-error:**
  - `offline` replaces Beacon's ping monitor.
  - `onReport(error, {boundary, digest})` replaces the Slack call.
- **network-status-banner:** `state` (online, offline, reconnecting, restored) and `appName`.
- **auth-error-page:** `error`, `appName`, `signInHref`, `supportEmail`.
- **forbidden-page:** `onGoBack`.
- **maintenance-banner:** `maintenance`, `product`.

## feedback/: feedback form and satisfaction prompts

Beacon and Vertex share the same feedback flow. Beacon's copies are the base:
they're built on `ui/`, show errors by the fields, and can attach an image.

| Piece | Copied from | Beacon | Vertex | Nexus | Design |
|---|---|---|---|---|---|
| `feedback-dialog` | Beacon | `features/feedback/feedback-dialog.ts` | byte-identical | `modules/feedback/utils/feedbackDialog.ts` | Same `airqo:feedback:open` event in all three |
| `feedback-launcher` | Beacon | `features/feedback/feedback-launcher.tsx` | same path | `FeedbackLauncher.tsx` | Beacon and Vertex: "Report an issue" or "Suggest an idea", then the form with screenshot, rating and consent. Nexus has a single different form |
| `page-satisfaction-banner` | Beacon | same path | same path | none | Same timing (30 s, or an interaction after 5 s) and 30-day cooldown |
| `satisfaction-feedback-toast` | Beacon | same path | `reusable-satisfaction-feedback-toast.tsx` | none | Same phases; Vertex's sits at z-[9999] and thanks you even when sending fails |
| `login-feedback-toast` | Beacon | same path | same path | none | Beacon asks right after sign-in; Vertex on any load until answered |
| `feedback-prompt-slot` | Beacon | same path | same code | none | Stops two prompts showing at once |
| `feedback-preferences` | Beacon | `lib/feedback-preferences.ts` | `core/utils/userPreferences.ts` | none | Cooldown storage; the key prefix (`beacon_`, `vertex_`) is now an option |
| `screenshot-annotator` + `screenshot-tools` | Beacon | standalone | inline in the launcher | inline in the launcher | Same in all three |

Props that replace app state:
- **feedback-launcher:**
  - `userEmail`, `app`, `appName`, `issueActions`, `getPageTitle`, `appVersion`,
    `extraMetadata`.
  - `onSubmit`.
  - `onUploadScreenshot`. Leave it out to hide screenshots; this replaces
    Beacon's off switch.
- **The prompts:**
  - `onSubmit` and `storageKeyPrefix`, plus their own text.
  - The login page must call
    `createFeedbackPreferences(prefix).markLoginStarted()`, or the login toast
    never shows.

## data-table/: the table

Vertex's `ReusableTable` and Nexus's `MultiSelectTable` come from the same
original (~1,500 lines each): the same props, search, filter dropdowns,
selection bar and pagination. Nexus's is the base because it draws everything
from the tokens; Vertex's hard-codes grays and `#1d1f20`. Beacon has no reusable
table: 12 pages each build their own on `ui/table`.

| Piece | Copied from | Vertex | Nexus | Notes |
|---|---|---|---|---|
| `multi-select-table` | Nexus | `shared/table/ReusableTable.tsx` (14 users) | `ui/multi-select-table.tsx` (5) | Client-side search, filters, selection, pagination |
| `server-side-table` | Nexus | inside ReusableTable (`serverSidePagination`) | `ui/server-side-table.tsx` (35) | Server paging with a "Rows per page" footer |
| `data-table` | Nexus | none | `ui/data-table.tsx` (2) | Simple table with caller-controlled sorting |
| `pagination`, `table-checkbox` | Nexus | inline | `ui/pagination.tsx`, `ui/checkbox.tsx` | The checkbox has an indeterminate state, which `ui/checkbox` lacks |
| `table-dialog` | Nexus | `ReusableDialog` | `ui/dialog.tsx` | Trimmed copy for the column filters; no framer-motion, so it works in Beacon |
| `table-export-modal` + `export-csv` | Vertex | built into ReusableTable | none | CSV export of the current page. Not wired into the base table; add it through `searchActions` |

How the two tables differ:
- **Only Vertex has:**
  - Table state kept in the URL.
  - Export.
  - `isRowSelectable`.
  - A sticky header.
- **Only Nexus has:**
  - Per-column filters.
  - A page-size picker and a "Showing x to y of z" line.
  - Error, refresh and custom empty states.
  - Controlled and single selection.
  - Column widths.
- **Sorting:** Nexus sorts numbers as numbers. Vertex compares them as strings,
  so 10 sorts before 9.

## tour/: product tour

`product-tour` and `tour-position` are from Beacon (`tour/product-tour.tsx`).
Nexus has the same spotlight and card in `modules/home/components/ProductTour.tsx`;
Vertex has none. Tour steps and the "seen" flag stay per app.

## Stacking order

Overlays inside overlays only work if the layers agree. The pieces gathered here
still carry their apps' numbers:

| Layer | z-index now | Pieces |
|---|---|---|
| sidebars, sheet, hover card, alert dialog, kit select (inline) | 30–50 | `section-sidebar`, `ui/sheet`, `ui/hover-card`, `ui/alert-dialog` |
| offline banner | 100 (Vertex and Nexus use 2000) | `status/network-status-banner` |
| feedback prompts | 1100 | `feedback/*` |
| shadcn dialog | 999 / 9999 | `ui/dialog` |
| top-bar menus, kit toast | 9999 | `help-menu`, `profile-menu`, `kit/toast` |
| app switcher, drawer, kit dialog, table dialog | 10000 / 10001 | `layout/app-*`, `kit/dialog`, `data-table/table-dialog` |
| popover, select, dropdown, tooltip | 10001 | `ui/*` |
| kit select list, drawer flyouts | 10002 | `kit/select`, `layout/app-drawer`, `layout/nav-item` |
| toast | 10003 | `ui/toast` |
| outliers | 12000, 99999, 100000 | `ui/command`, `section-sidebar` tooltips, `dashboard-layout` skip link |

The Tailwind preset adds named layers (`z-top-bar`, `z-dialog`, `z-menu`,
`z-popover`, `z-toast`) using Beacon's values, as a starting scale. Nothing uses
them yet.

**Known clashes:**
- `ui/alert-dialog` sits at z-50, below an open `ui/dialog`.
- `kit/dialog` content (10001) ties with the shadcn popovers, so whether a
  `ui/select` inside it shows on top depends on DOM order.
- `ui/command` sits at z-[12000], above everything else.

## Doesn't follow the tokens yet

These keep hard-coded colours, so a token change won't reach them:
- **`ui/dialog`** uses `bg-white`.
- **`kit/card-wrapper`** uses `bg-white dark:bg-[#1d1f20]`.
- **`status/permission-tooltip`** is always light.
- **`status/forbidden-page`** uses `text-black-900` and `text-grey-400`, which
  aren't Tailwind classes, so they do nothing.
- **`page/stat-card`** icon colours (blue, emerald, amber, …) are fixed Tailwind
  colours on purpose; only `primary` and `slate` follow the theme.
- **Loader class names:** `styles/loader.css` (`.SecondaryMainloader`, Beacon and
  Nexus); Vertex names the same spinner `.secondary-main-loader`.

## What an app needs to use these

- **Tailwind:**
  - Add `presets: [require('../shared/theme/tailwind-preset')]` to the config.
  - Add `'../shared/**/*.{ts,tsx}'` to `content`. A preset's `content` isn't
    merged, so this must be in the app's own config.
- **CSS:** import `theme/tokens.css`, then `theme/base.css`, then
  `styles/loader.css`, in the app's `globals.css` after the `@tailwind` lines.
  Remove the app's own copies of the same variables.
- **Font:** put `inter.variable` from `theme/fonts.ts` on `<html>`.
- **Packages:**
  - **Already in every dashboard:** `react`, `next`, `clsx`, `tailwind-merge`,
    `class-variance-authority`, `lucide-react`, `@airqo/icons-react`, `sonner`.
  - **Radix**, for the primitives used: `slot`, `dialog`, `alert-dialog`, `toast`,
    `select`, `popover`, `dropdown-menu`, `tabs`, `switch`, `checkbox`, `label`,
    `avatar`, `accordion`, `tooltip`, `hover-card`, `progress`, `scroll-area`,
    `separator`, `collapsible`, `radio-group`, `toggle`.
  - **Per piece:**
    - `react-day-picker@8` (calendar), `cmdk` (command), `react-hook-form`
      (form), `recharts` (chart).
    - `react-icons` (social buttons), `@smastrom/react-rating` (feedback).
    - `fuse.js` and `papaparse` (data-table).
    - `framer-motion` (kit/dialog), `react-popper` and `@popperjs/core`
      (kit/select).
  - **Gaps:**
    - Beacon has no `framer-motion`, `papaparse` or `react-popper`.
    - Vertex has no `react-popper`.
    - Nexus has no `tailwindcss-animate` or `react-day-picker` (it has its own
      calendar).
    - Only Nexus declares `fuse.js`; Beacon and Vertex get it indirectly.
- **Assets:** `app-switcher` expects the mobile QR code at `/images/AQR.jpeg`
  (Nexus keeps it at `/images/QR/AQR.jpeg`; pass `qrCodeSrc`).
- **Build:** these are TypeScript sources outside each app's folder. A Next app
  needs `experimental.externalDir` (or a workspace package with
  `transpilePackages`) plus a path alias. Not set up yet. The staging deploy
  filters on `src/<app>/*`, so changes here don't trigger a deploy on their own.

## Decisions before wiring an app

1. **Two component sets.** `ui/` (shadcn, Beacon) and `kit/` (Vertex, Nexus)
   both read the same tokens, so token changes reach both. But a dialog or button
   still looks different depending on which set a page uses. Picking one per
   component (dialog, button, input, select, toast) is the next merge.
2. **Dark palette.** Beacon's is in `tokens.css`; the Nexus and Vertex values are
   in the comment beside it.
3. **Stat card design:** Beacon's is in; Vertex's and Nexus's differ.
4. **One z-index scale** (see Stacking order).
5. **Card border:** whether `ui/card` takes Nexus's "bordered" theme style.

## Not gathered

- **Different in each app; pick a design first:**
  - Onboarding checklist: Vertex `onboarding-checklist`, Nexus
    `modules/user-checklist`, Beacon's home prompts.
  - Charts: Vertex `shared/charts`, Nexus's chart module, Beacon's per-page
    Recharts.
  - Phone navigation.
- **One app only:**
  - Nexus: notification banner, weather widget, rich text editor, phone input.
  - Beacon: local SVG icons in `components/icons/` (these belong in
    `@airqo/icons-react`).
  - Beacon: chunk-load error handler.
- **Logic, not UI:** auth and session providers, API services, Redux stores, route
  guards.

## Problems noticed along the way

**Beacon:**
- **Sign-in errors land on a 404.** `lib/auth.ts` points next-auth errors to
  `/auth-error`, which `staging` doesn't have. The page exists on branch
  `claude/loving-wilbur-92b830` (commit `6bf11b729`), not pushed yet.
- **No 404 page,** so it shows Next's default. `page/not-found-page` covers it.
- **No reusable table:** 12 pages build their own.
- **13 shadcn primitives installed but never imported** (listed under `ui/`).

**Vertex:**
- **Shadcn animations are inert.** `tailwindcss-animate` is installed but not in
  `tailwind.config.ts`.
- **Inverted focus rule.** `globals.css` has
  `button:focus:not(:focus-visible) { outline }`, which draws the outline on
  mouse focus and removes it on keyboard focus.
- **No module navigation on phones.** The section sidebar is `hidden lg:block`
  with no fallback.
- **Session loader is opaque white,** so it flashes in dark mode.
- **Classes that never generate:**
  - `ReusableDialog`'s `zIndex` builds `z-[${zIndex}]` at runtime.
  - `CardWrapper`'s overflow class is built the same way.
  - `ReusableInputField` uses `pr-18` and `pr-26`, which aren't Tailwind classes.
  - `ReusableButton`'s `showTextOnMobile` has no effect.
- **Login feedback toast** can ask on any page load, and never sends the landing
  page.
- **Dead files:**
  - `layout/sub-menu.tsx`
  - `layout/loading/org-loading.tsx`
  - `ui/select-field.tsx`
  - `ui/custom-dialog.tsx`
  - `ui/stepper.tsx`
  - `ui/ErrorBoundary.tsx`, which duplicates `shared/ErrorBoundary.tsx`.

**Nexus:**
- **Dialogs don't stack.** Escape closes every open dialog, and closing an inner
  one unlocks page scroll. `kit/dialog` fixes both.
- **The table treats any `onSearchChange` as server-paginated,** so a client
  table with controlled search shows every row.
- **No auth error page,** so next-auth shows its default.
- **`global-error.tsx` uses inline hard-coded colours.**
- **`NoInternetConnection.tsx` is unused.**

**Across the apps:**
- **The app switchers list different apps.** Vertex's has no Beacon. Nexus's
  link and name differ between apps, and so does the API docs link.
- **Light-mode muted text fails WCAG AA** in Beacon and Nexus (4.4:1). Fixed in
  `tokens.css`.
