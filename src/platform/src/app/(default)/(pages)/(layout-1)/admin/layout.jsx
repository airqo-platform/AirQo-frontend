import { Suspense } from 'react';

export default function AdminLayout({ children }) {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
}
