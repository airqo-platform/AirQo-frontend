'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useOrganization } from '@/app/providers/OrganizationProvider';
import { FaUser, FaSignOutAlt, FaBell } from 'react-icons/fa';

export default function OrganizationHeader({ organization }) {
  const { data: session } = useSession();
  const { getDisplayName, getFullPath, logo, primaryColor } = useOrganization();
  const params = useParams();
  const router = useRouter();

  const orgSlug = params?.org_slug?.join('/') || '';

  const handleSignOut = async () => {
    await signOut({ callbackUrl: `/${orgSlug}/login` });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Organization Logo and Name */}
          <div className="flex items-center">
            <Link href={`/${orgSlug}/Home`} className="flex items-center">
              <img
                src={logo}
                alt={`${organization?.name} logo`}
                className="h-8 w-8 mr-3"
                onError={(e) => {
                  e.target.src = '/icons/airqo_logo.svg';
                }}
              />
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-gray-900">
                  {getDisplayName()}
                </h1>
                {organization?.description && (
                  <p className="text-xs text-gray-500 truncate max-w-xs">
                    {organization.description}
                  </p>
                )}
              </div>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button
              className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full"
              style={{ '--tw-ring-color': primaryColor }}
            >
              <FaBell className="h-5 w-5" />
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <div className="flex items-center space-x-3">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {session?.user?.name || session?.user?.email}
                  </span>
                  <span className="text-xs text-gray-500">
                    {organization?.name}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    href={`/${orgSlug}/settings`}
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full"
                    style={{ '--tw-ring-color': primaryColor }}
                    title="Settings"
                  >
                    <FaUser className="h-4 w-4" />
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full"
                    style={{ '--tw-ring-color': primaryColor }}
                    title="Sign Out"
                  >
                    <FaSignOutAlt className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
