'use client';

import React from 'react';
import OopsIcon from '@/icons/Errors/OopsIcon';

const PermissionDenied = () => (
  <div className="flex flex-col justify-center items-center min-h-[60vh] w-full p-4 text-center">
    {/* Responsive container for the icon */}
    <div className="w-40 sm:w-56 mb-6">
      <OopsIcon className="text-primary" />
    </div>

    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
      Access Denied
    </h1>

    <p className="max-w-md mt-2 text-base text-slate-600 dark:text-slate-300">
      You do not have the necessary permissions to view this page.
    </p>

    <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
      If you believe this is an error, please contact your system administrator.
    </p>

    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
      Error Code: 403 Forbidden
    </p>
  </div>
);

export default PermissionDenied;
