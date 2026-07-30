'use client';

import React from 'react';
import { AqCheckCircle } from '@airqo/icons-react';
import {
  PASSWORD_REQUIREMENTS,
  PASSWORD_SPECIAL_CHARS_DISPLAY,
  type PasswordRequirement,
} from '@/shared/lib/validators';

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

const RequirementItem: React.FC<{
  requirement: PasswordRequirement;
  met: boolean;
}> = ({ requirement, met }) => (
  <li className="flex items-center gap-2 text-xs">
    <AqCheckCircle
      aria-hidden="true"
      className={`w-3.5 h-3.5 flex-shrink-0 ${
        met
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-gray-300 dark:text-gray-600'
      }`}
    />
    <span
      className={
        met
          ? 'text-emerald-700 dark:text-emerald-300'
          : 'text-gray-500 dark:text-gray-400'
      }
    >
      {requirement.label}
    </span>
    <span className="sr-only">{met ? 'met' : 'not met'}</span>
  </li>
);

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  className = '',
}) => {
  const requirements = PASSWORD_REQUIREMENTS.map(req => ({
    ...req,
    met: req.test(password),
  }));

  return (
    <div className={`mt-2 ${className}`}>
      <ul className="space-y-1">
        {requirements.map(req => (
          <RequirementItem key={req.label} requirement={req} met={req.met} />
        ))}
      </ul>
      {password.length > 0 && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Special characters: {PASSWORD_SPECIAL_CHARS_DISPLAY}
        </p>
      )}
    </div>
  );
};
