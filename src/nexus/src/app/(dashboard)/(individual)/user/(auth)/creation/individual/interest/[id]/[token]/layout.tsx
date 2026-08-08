import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Interests',
};

export default function InterestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
