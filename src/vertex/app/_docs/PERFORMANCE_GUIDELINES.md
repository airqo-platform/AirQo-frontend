# ⚡ AirQo Vertex Performance Guidelines

> **"Performance is a feature."**
> This document outlines the mandatory standards for all code contributions to ensure the application remains fast, responsive, and efficient.

## 1. The "Lazy First" Rule (Components)

**Rule**: Any component that is not visible immediately on page load (Modals, Dialogs, Below-the-fold content) MUST be lazy loaded.

### 🚫 Anti-Pattern
Importing heavy components synchronously at the top of the file.
```typescript
import ClaimDeviceModal from '@/components/features/claim/claim-device-modal'; // ❌ Bad: Loads immediately
import { ExpensiveChart } from 'react-chartjs-2'; // ❌ Bad: 200KB bundle impact

export default function Page() {
  return (
    <>
      <Component />
      <ClaimDeviceModal />
    </>
  )
}
```

### ✅ Best Practice
Use `next/dynamic` to load components only when they are needed.
```typescript
import dynamic from 'next/dynamic';

const ClaimDeviceModal = dynamic(
  () => import('@/components/features/claim/claim-device-modal'),
  { ssr: false } // ✅ Good: Loads only when browser is idle or component is rendered
);

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Component />
      {isOpen && <ClaimDeviceModal />} {/* ✅ Loads code chunk here */}
    </>
  )
}
```

---

## 2. The "No Waterfall" Rule (Data Fetching)

**Rule**: Never await multiple independent asynchronous calls sequentially. Run them in parallel.

### 🚫 Anti-Pattern
Waiting for one request to finish before starting the next.
```typescript
// ❌ Bad: Takes (A + B) seconds
const user = await fetchUser();
const devices = await fetchDevices(); 
```

### ✅ Best Practice
Use `Promise.all` to fetch data concurrently.
```typescript
// ✅ Good: Takes max(A, B) seconds
const [user, devices] = await Promise.all([
  fetchUser(),
  fetchDevices()
]);
```

**Note**: For React Components, use separate `useQuery` hooks. They run in parallel by default!

---

## 3. The "Import Diet" Rule (Dependencies)

**Rule**: Avoid importing huge libraries for simple tasks. Audit your imports.

- **Dates**: Use `date-fns` (modular), NOT `moment.js` (monolithic).
- **Icons**: Import specific icons, NOT the entire library.
  - ✅ `import { Plus } from 'lucide-react'`
  - ❌ `import * as Icons from 'lucide-react'`
- **Utils**: If you only need one function from `lodash`, install `lodash.debounce` or write it yourself.

---

## 4. The "Instant Feedback" Rule (UX)

**Rule**: The UI must respond immediately (<100ms) to user actions, even if the backend is slow.

### ✅ Best Practice
- **Optimistic UI**: Update the UI logic immediately, then verify with the API.
- **Skeletons**: Show a Loading Skeleton immediately while fetching data.
- **PersistGate**: For `Redux`, ensure `<PersistGate>` is used so the app renders with cached data instantly on reload.

---

## 5. The "2-Second" Compilation Rule

**Rule**: If a page takes more than 2 seconds to compile in development `npm run dev`, it is too heavy.

**Action**:
1. Run `next build` to see the breakdown.
2. Check the module count for that page.
3. Identify heavy imports (Maps, Charts, QR Scanners) and **Lazy Load** them.

---

## Checklist for Code Reviews

- [ ] Does this PR introduce a new heavy dependency?
- [ ] Are all modals/dialogs lazy loaded?
- [ ] Are we blocking the UI thread?
- [ ] Did we accidentally break tree-shaking?

**Keep it fast. Keep it clean.** 🚀
