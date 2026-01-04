'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Moon, Sun } from 'lucide-react';
import { AqMenu01 } from '@airqo/icons-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppSelector } from '@/core/redux/hooks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import OrganizationPicker from '../features/org-picker/organization-picker';
import Image from 'next/image';
import Card from '../shared/card/CardWrapper';
import { useLogout } from '@/core/hooks/useLogout';
import AppDropdown from './AppDropdown';
import { useSession } from 'next-auth/react';
import type { UserDetails } from '@/app/types/users';

interface TopbarProps {
  onMenuClick: () => void;
}

const AirqoLogoRaw = '/images/airqo_logo.svg';

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const [darkMode, setDarkMode] = useState(false);
  const currentUser = useAppSelector(state => state.user.userDetails);
  const logout = useLogout();
  const router = useRouter();
  const { data: session } = useSession();

  const user = currentUser || (session?.user as unknown as Partial<UserDetails> & { image?: string | null });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogoClick = useCallback(() => {
    router.push('/home');
  }, [router]);

  const LogoComponent = useCallback(
    ({ className = '', buttonProps = {} }) => (
      <Button
        onClick={handleLogoClick}
        variant="ghost"
        className={`inline-flex items-center justify-center p-0 m-0 ${className}`}
        {...buttonProps}
      >
        <Image
          src={AirqoLogoRaw}
          alt="AirQo logo"
          width={120}
          height={32}
          className="w-auto h-6"
          priority
        />
      </Button>
    ),
    [handleLogoClick]
  );

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user) return 'U';
    const first = user.firstName || '';
    const last = user.lastName || '';
    return `${first.charAt(0) || ''}${last.charAt(0) || ''}`.toUpperCase();
  };

  // Format user name
  const getUserName = () => {
    if (!user) return 'User';
    return (
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      user.userName ||
      user.email ||
      'User'
    );
  };

  return (
    <header className="fixed flex flex-col gap-2 px-1 md:px-2 py-1 top-0 left-0 right-0 z-[999]">
      <Card className={`w-full bg-white`} padding="py-1 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={onMenuClick}
              className="inline-flex items-center justify-center focus:outline-none min-h-[32px] hover:bg-blue-50 p-2 rounded-md"
            >
              <span>
                <AqMenu01 className="text-foreground" />
              </span>
            </button>
            <LogoComponent
              className={`flex items-center justify-center text-gray-800`}
            />
            <span className="font-medium text-lg tracking-tight">Vertex</span>
          </div>

          <div className="flex items-center gap-x-1 ml-auto">
            <OrganizationPicker />

            <AppDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center cursor-pointer hover:bg-transparent p-0 m-0"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user?.profilePicture || user?.image || ''}
                      alt={getUserName()}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 px-2">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user?.profilePicture || user?.image || ''}
                      alt={getUserName()}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                      {getUserName().length > 18
                        ? getUserName().slice(0, 18) + '...'
                        : getUserName()}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || user?.userName}
                    </p>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2"
                >
                  {darkMode ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center"
                  onClick={logout}
                >
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </header>
  );
};

export default Topbar;
