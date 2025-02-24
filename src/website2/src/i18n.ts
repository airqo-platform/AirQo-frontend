import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

import { locales } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locales.includes(locale as any)) notFound();

  return {
    locale,
    messages: (await import(`../public/locales/${locale}.json`)).default,
  };
});
