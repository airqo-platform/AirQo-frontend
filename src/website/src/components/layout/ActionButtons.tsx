'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

import mainConfig from '@/config/site.config';
import { useDispatch } from '@/hooks';
import { openModal } from '@/store/slices/modalSlice';

import ActionCard from './ActionCard';

const ActionButtons = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  return (
    <div
      className={`flex flex-col md:flex-row gap-6 w-full ${mainConfig.containerClass}`}
    >
      <ActionCard
        title="Explore our digital tools. Learn about the quality of air around you."
        buttonText="Explore data →"
        onClick={() => router.push('/explore-data')}
        variant="primary"
      />
      <ActionCard
        title="Get involved. Learn about ways you can support our vision."
        buttonText="Get Involved →"
        onClick={() => dispatch(openModal())}
        variant="secondary"
      />
    </div>
  );
};

export default ActionButtons;
