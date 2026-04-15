'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';

import { getFlagUrl } from '@/utils/languages';

interface LanguageFlagProps {
  flag: string;
  country: string;
  languageCode: string;
  width: number;
  height: number;
  wrapperClassName?: string;
  imageClassName?: string;
  fallbackTextClassName?: string;
}

const LanguageFlag: React.FC<LanguageFlagProps> = ({
  flag,
  country,
  languageCode,
  width,
  height,
  wrapperClassName,
  imageClassName,
  fallbackTextClassName,
}) => {
  const [hasError, setHasError] = useState(false);

  const languageAbbreviation = useMemo(
    () => languageCode.split('-')[0].toUpperCase(),
    [languageCode],
  );

  useEffect(() => {
    setHasError(false);
  }, [languageCode]);

  return (
    <span className={wrapperClassName} role="img" aria-label={country}>
      {hasError ? (
        <span
          className={
            fallbackTextClassName ||
            'flex items-center justify-center w-full h-full bg-blue-100 text-blue-600 font-semibold text-xs rounded border border-blue-200'
          }
        >
          {languageAbbreviation}
        </span>
      ) : (
        <Image
          src={getFlagUrl(flag)}
          alt={`${country} flag`}
          width={width}
          height={height}
          className={imageClassName || 'object-cover'}
          unoptimized
          onError={() => setHasError(true)}
        />
      )}
    </span>
  );
};

export default LanguageFlag;
