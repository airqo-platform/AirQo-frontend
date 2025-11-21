import { AdminPageGuard } from '@/shared/components';

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminPageGuard
      requiredPermissionsInActiveGroup={['USER_INVITE', 'USER_MANAGEMENT']}
    >
      {children}
    </AdminPageGuard>
  );
}
