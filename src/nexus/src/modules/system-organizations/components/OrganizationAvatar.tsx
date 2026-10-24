'use client';

import React from 'react';
import Image from 'next/image';
import { getRenderableImageSrc } from '@/shared/lib/image';
import { cn } from '@/shared/lib/utils';
import { getOrganizationInitials } from '../utils';

export interface OrganizationAvatarProps {
  /** Organization title — drives the initials fallback. */
  title: string;
  imageUrl?: string | null;
  /** `sm` = table rows (32px), `lg` = detail header (56px). */
  size?: 'sm' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<'sm' | 'lg', string> = {
  sm: 'h-8 w-8 text-xs',
  lg: 'h-14 w-14 text-lg',
};

const PIXELS: Record<'sm' | 'lg', number> = {
  sm: 32,
  lg: 56,
};

/**
 * Organization avatar: the profile image when it can actually be rendered
 * (see `getRenderableImageSrc`), otherwise an initials badge. One component
 * so the list and detail pages cannot drift apart.
 */
const OrganizationAvatar: React.FC<OrganizationAvatarProps> = ({
  title,
  imageUrl,
  size = 'sm',
  className,
}) => {
  const imageSrc = getRenderableImageSrc(imageUrl);
  const sizeClasses = SIZE_CLASSES[size];

  if (imageSrc) {
    return (
      <Image
        src={imageSrc}
        alt=""
        width={PIXELS[size]}
        height={PIXELS[size]}
        className={cn(
          sizeClasses,
          'shrink-0 rounded-full object-cover',
          className
        )}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        sizeClasses,
        'flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold uppercase text-primary',
        className
      )}
    >
      {getOrganizationInitials(title)}
    </span>
  );
};

export default OrganizationAvatar;
