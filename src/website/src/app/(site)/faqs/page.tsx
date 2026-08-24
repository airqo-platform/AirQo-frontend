import MainLayout from '@/components/layout/MainLayout';
import { FAQPage } from '@/features/faqs';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import { faqService } from '@/services/website';
import type { FAQ } from '@/types/api';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.faqs);
export const viewport = generateViewport();

// Regenerate hourly so the FAQPage JSON-LD stays in sync with CMS-managed FAQs
export const revalidate = 3600;

const toPlainText = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Build FAQPage JSON-LD from the same service the client FAQ list uses.
 * Returns null on fetch error or when there is no usable Q/A data,
 * so the page never breaks and no empty schema is emitted.
 */
const getFaqJsonLd = async () => {
  try {
    const firstResponse = await faqService.getFAQs(
      {},
      { page: 1, page_size: 100 },
    );
    const totalPages = Math.max(1, Number(firstResponse?.total_pages) || 1);
    const responses = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        faqService.getFAQs({}, { page: index + 2, page_size: 100 }),
      ),
    );
    const faqs: FAQ[] = [firstResponse, ...responses]
      .flatMap((response) => response?.results ?? [])
      .filter((faq: FAQ) => faq.is_active);

    const mainEntity = faqs
      .map((faq: FAQ) => ({
        '@type': 'Question',
        name: (faq.question || '').trim(),
        acceptedAnswer: {
          '@type': 'Answer',
          // `answer` may still contain HTML from the CMS; strip tags either way
          text:
            toPlainText(faq.answer || '') || toPlainText(faq.answer_html || ''),
        },
      }))
      .filter((item) => item.name && item.acceptedAnswer.text);

    if (mainEntity.length === 0) {
      return null;
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity,
    };
  } catch {
    return null;
  }
};

const Page = async () => {
  const jsonLd = await getFaqJsonLd();

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
      )}
      <MainLayout>
        <FAQPage />
      </MainLayout>
    </>
  );
};

export default Page;
