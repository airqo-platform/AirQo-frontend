import { MainLayout } from '@/shared/layouts/MainLayout';

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout showSidebar={true} showBottomNav={false}>
      {children}
    </MainLayout>
  );
}
