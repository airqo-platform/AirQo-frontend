'use client';

import React from 'react';
import {
  FaApple,
  FaFacebook,
  FaGithub,
  FaGoogle,
  FaLinkedin,
  FaMicrosoft,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import type { AuthMethods } from '@/shared/types/api';
import { Banner, Card, CardContent } from '@/shared/components/ui';

interface ConnectedAccountsProps {
  authMethods?: AuthMethods;
  loading?: boolean;
}

const PROVIDERS: Array<{
  key: keyof Omit<AuthMethods, 'password'>;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'google', label: 'Google', Icon: FaGoogle },
  { key: 'github', label: 'GitHub', Icon: FaGithub },
  { key: 'linkedin', label: 'LinkedIn', Icon: FaLinkedin },
  { key: 'microsoft', label: 'Microsoft', Icon: FaMicrosoft },
  { key: 'twitter', label: 'X', Icon: FaXTwitter },
  { key: 'facebook', label: 'Facebook', Icon: FaFacebook },
  { key: 'apple', label: 'Apple', Icon: FaApple },
];

const ConnectedAccounts: React.FC<ConnectedAccountsProps> = ({
  authMethods,
  loading = false,
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-5">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Connected Accounts
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Review the third-party providers linked to your AirQo account.
          </p>
        </div>

        {loading ? (
          <div className="h-24 animate-pulse rounded-md bg-gray-100 motion-reduce:animate-none dark:bg-gray-800" />
        ) : !authMethods ? (
          <Banner
            severity="info"
            title="Connected accounts unavailable"
            message="We could not load your provider connections. Refresh the page and try again."
          />
        ) : (
          <div className="divide-y divide-gray-200 rounded-md border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
            {PROVIDERS.map(({ key, label, Icon }) => {
              const isConnected = authMethods[key] === true;

              return (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0 text-gray-700 dark:text-gray-200" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {label}
                    </span>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-medium ${
                      isConnected
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {isConnected ? 'Connected' : 'Not connected'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Provider connections are view-only here. Contact support if you need
          to change a connection.
        </p>
      </CardContent>
    </Card>
  );
};

export default ConnectedAccounts;
