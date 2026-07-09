// components/logout-button.tsx (create this file)
"use client"

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function LogoutButton() {
  const router = useRouter();
  
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login?logout=true' });
  };
  
  return (
    <Button onClick={handleLogout} variant="outline">
      Sign Out
    </Button>
  );
}