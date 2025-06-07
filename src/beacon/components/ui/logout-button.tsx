// components/logout-button.tsx (create this file)
"use client"

import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default function LogoutButton() {
  const router = useRouter();
  
  const handleLogout = () => {
    logout();
    router.push('/login?logout=true');
  };
  
  return (
    <Button onClick={handleLogout} variant="outline">
      Sign Out
    </Button>
  );
}