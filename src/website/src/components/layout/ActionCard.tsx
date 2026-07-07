'use client';
import React from 'react';

import { CustomButton } from '../ui';

interface ActionCardProps {
  title: string;
  buttonText: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const ActionCard = ({
  title,
  buttonText,
  onClick,
  variant = 'primary',
}: ActionCardProps) => {
  const isPrimary = variant === 'primary';

  return (
    <CustomButton onClick={onClick} className="bg-transparent p-0 m-0">
      <div
        className={`flex flex-col justify-between items-start text-start md:rounded-xl p-8 w-full cursor-pointer transform transition-transform duration-300 focus:outline-none ${
          isPrimary ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
        }`}
      >
        <div>
          <h3 className="text-2xl font-medium mb-4">{title}</h3>
        </div>
        <p className="mt-4 text-lg hover:underline">{buttonText}</p>
      </div>
    </CustomButton>
  );
};

export default ActionCard;
