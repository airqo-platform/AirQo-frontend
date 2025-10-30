'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AqUser03 } from '@airqo/icons-react';
import {
  Avatar,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/ui';
import { ProfileDropdownProps } from '../types';
import { useLogout, useUser } from '@/shared/hooks';

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  className,
}) => {
  const { data: session } = useSession();
  const { user } = useUser();
  const logout = useLogout();

  const handleSignOut = async () => {
    await logout();
  };

  // Use user data from useUser hook, fallback to session for name/email if needed
  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : session?.user?.name || 'User';
  const userEmail = user?.email || session?.user?.email || '';
  const userImage = user?.profilePicture || session?.user?.image || undefined;

  return (
    <DropdownMenu className={className}>
      <div className="h-full flex justify-center flex-col">
        <DropdownMenuTrigger>
          <Avatar
            src={userImage}
            alt={displayName}
            fallback={displayName}
            size="md"
          />
        </DropdownMenuTrigger>
      </div>

      <DropdownMenuContent>
        <div className="space-y-3 min-w-[200px]">
          <div className="flex items-center gap-3 pb-3 border-b">
            <Avatar
              src={userImage}
              alt={displayName}
              fallback={displayName}
              size="sm"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-base font-medium truncate">
                {displayName}
              </span>
              <span className="text-sm max-w-[150px] text-muted-foreground truncate">
                {userEmail}
              </span>
            </div>
          </div>

          <Link
            href="/user/profile"
            className="flex items-center gap-3 text-muted-foreground rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors"
          >
            <AqUser03 className="h-5 w-5 flex-shrink-0" />
            <span className="font-normal">My profile</span>
          </Link>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleSignOut}>
            <span className="text-red-600">Log out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
