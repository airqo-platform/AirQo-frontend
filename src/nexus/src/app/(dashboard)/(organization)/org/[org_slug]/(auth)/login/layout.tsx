import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Organization Login',
};

export default function OrgLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
