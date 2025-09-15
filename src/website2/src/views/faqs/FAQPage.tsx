'use client';

import DOMPurify from 'dompurify';
import React, { useMemo, useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

import { Accordion, Input, NoData, Pagination } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { useFAQs } from '@/hooks/useApiHooks';
import { FAQ } from '@/types';

// Configure DOMPurify once on the client to allow common tags/attributes
// and to harden links (external links open with rel=noopener noreferrer and target=_blank)
if (typeof window !== 'undefined') {
  const _win = window as any;
  if (!_win.__domPurifyConfigured) {
    // Broad but safe whitelist of tags commonly used in rich content
    const allowedTags = [
      'a',
      'abbr',
      'acronym',
      'address',
      'area',
      'article',
      'aside',
      'b',
      'bdi',
      'bdo',
      'big',
      'blockquote',
      'br',
      'caption',
      'center',
      'cite',
      'code',
      'col',
      'colgroup',
      'data',
      'datalist',
      'dd',
      'del',
      'details',
      'dfn',
      'dialog',
      'div',
      'dl',
      'dt',
      'em',
      'figcaption',
      'figure',
      'footer',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'header',
      'hr',
      'i',
      'img',
      'ins',
      'kbd',
      'label',
      'legend',
      'li',
      'main',
      'map',
      'mark',
      'menu',
      'meter',
      'nav',
      'ol',
      'output',
      'p',
      'pre',
      'progress',
      'q',
      'rp',
      'rt',
      'ruby',
      's',
      'samp',
      'section',
      'small',
      'span',
      'strong',
      'sub',
      'summary',
      'sup',
      'table',
      'tbody',
      'td',
      'textarea',
      'tfoot',
      'th',
      'thead',
      'time',
      'tr',
      'track',
      'u',
      'ul',
      'var',
      'wbr',
      'figure',
      'figcaption',
      'code',
      'pre',
    ];

    // Broad, commonly-used attributes. Avoid allowing `style` or event handlers (on*) for safety.
    const allowedAttrs = [
      'href',
      'title',
      'target',
      'rel',
      'src',
      'alt',
      'width',
      'height',
      'srcset',
      'loading',
      'decoding',
      'class',
      'id',
      'role',
      'aria-label',
      'aria-hidden',
      'aria-describedby',
      'aria-labelledby',
      'colspan',
      'rowspan',
      'scope',
      'align',
      'cellpadding',
      'cellspacing',
      'data',
      'data-*',
      'data-src',
      'data-type',
      'download',
      'hreflang',
      'type',
      'poster',
      'muted',
      'controls',
      'preload',
      'autoplay',
    ];

    try {
      DOMPurify.setConfig({
        ALLOWED_TAGS: allowedTags,
        ALLOWED_ATTR: allowedAttrs,
      });
    } catch {
      // setConfig may throw in some DOMPurify versions; ignore and pass config per-call instead
    }

    // Keep data-* and aria-* attributes and validate image srcs
    DOMPurify.addHook('uponSanitizeAttribute', (node: any, data: any) => {
      const name: string = data.attrName || '';
      if (name.startsWith('data-') || name.startsWith('aria-')) {
        data.keepAttr = true;
      }

      // Allow image src if it's an absolute URL, protocol-relative, or data URI
      if (node.tagName === 'IMG' && name === 'src') {
        const v = (data.attrValue || '').toString();
        if (/^(https?:|data:|\/\/)/i.test(v)) {
          data.keepAttr = true;
        }
      }
    });

    // Force external links to open safely
    DOMPurify.addHook('afterSanitizeAttributes', (node: any) => {
      if (node.tagName && node.tagName.toLowerCase() === 'a') {
        try {
          const href = node.getAttribute('href') || '';
          // Consider links with a host different from current origin as external (also protocol-relative)
          const isExternal =
            href &&
            !href.startsWith('#') &&
            !href.startsWith('mailto:') &&
            !href.startsWith('tel:') &&
            !(href.startsWith('/') || href.startsWith(window.location.origin));
          if (isExternal) {
            node.setAttribute('target', '_blank');
            let rel = node.getAttribute('rel') || '';
            if (!/\bnoopener\b/.test(rel)) rel = (rel + ' noopener').trim();
            if (!/\bnoreferrer\b/.test(rel)) rel = (rel + ' noreferrer').trim();
            node.setAttribute('rel', rel);
          }
        } catch {
          // ignore errors in hook
        }
      }
    });

    _win.__domPurifyConfigured = true;
  }
}

const FAQPage: React.FC = () => {
  const { data: faqs, isLoading, isError } = useFAQs();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openAccordionId, setOpenAccordionId] = useState<number | null>(null);
  const itemsPerPage = 10;

  // Filter and search FAQs with null safety
  const filteredFaqs = useMemo(() => {
    const faqsList = faqs ?? [];
    const activeFaqs = faqsList.filter((faq: FAQ) => faq.is_active);

    if (!searchQuery.trim()) {
      return activeFaqs;
    }

    const needle = searchQuery.trim().toLowerCase();

    return activeFaqs.filter((faq: FAQ) => {
      const q = (faq.question || '').toLowerCase();
      const a = (faq.answer || '').toLowerCase();
      const aHtmlText = stripHtml(faq.answer_html || '').toLowerCase();
      return (
        q.includes(needle) || a.includes(needle) || aHtmlText.includes(needle)
      );
    });
  }, [faqs, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredFaqs.length / itemsPerPage);
  const displayedFaqs = filteredFaqs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
    setOpenAccordionId(null); // Close any open accordion when searching
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    setOpenAccordionId(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setOpenAccordionId(null); // Close any open accordion when changing pages
  };

  const handleAccordionToggle = (faqId: number) => {
    setOpenAccordionId(openAccordionId === faqId ? null : faqId);
  };

  // Helper: strip simple HTML tags to text for search indexing
  function stripHtml(input: string): string {
    if (!input) return '';
    // cheap and sufficient for search indexing
    return input.replace(/<[^>]*>/g, ' ');
  }

  // Simple Skeleton Loader component
  const FAQSkeleton = () => (
    <div className="border-b border-gray-300 mb-4 animate-pulse">
      <div className="flex justify-between items-center py-4">
        <div className="w-3/4 h-6 bg-gray-300 rounded-md"></div>
        <div className="w-5 h-5 bg-gray-300 rounded-md"></div>
      </div>
    </div>
  );

  const renderFAQContent = (answerHtml: string) => {
    const safeHtml = DOMPurify.sanitize(answerHtml || '', {
      ALLOWED_TAGS: [
        'a',
        'p',
        'ul',
        'ol',
        'li',
        'em',
        'strong',
        'b',
        'i',
        'br',
        'hr',
        'blockquote',
        'code',
        'pre',
        'h2',
        'h3',
        'h4',
      ],
      ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    });

    return (
      <div
        className="prose prose-sm max-w-none text-gray-600"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    );
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header Section */}
      <section className="mb-12 bg-[#F2F1F6] px-4 lg:px-0 py-16">
        <div className={`${mainConfig.containerClass} w-full`}>
          <h1 className="text-4xl font-bold mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about AirQo and our services
          </p>
        </div>
      </section>

      {/* FAQs Section */}
      <section className={`${mainConfig.containerClass} px-4 lg:px-0 mb-16`}>
        <div className="w-full">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-10 py-3 text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                >
                  <FiX className="h-5 w-5 text-gray-400" />
                </button>
              )}
            </div>

            {/* Search Results Count */}
            {searchQuery && !isLoading && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  {filteredFaqs.length === 0
                    ? 'No FAQs found matching your search'
                    : `${filteredFaqs.length} FAQ${
                        filteredFaqs.length !== 1 ? 's' : ''
                      } found`}
                </p>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="w-full">
              {[...Array(5)].map((_, index) => (
                <FAQSkeleton key={index} />
              ))}
            </div>
          ) : isError ? (
            <NoData message="Failed to load FAQs. Please try again later." />
          ) : filteredFaqs.length > 0 ? (
            <>
              {/* FAQ List */}
              <div className="w-full">
                {displayedFaqs.map((faq: FAQ) => (
                  <Accordion
                    key={faq.id}
                    title={faq.question || 'Untitled'}
                    isOpen={openAccordionId === faq.id}
                    onToggle={() => handleAccordionToggle(faq.id)}
                  >
                    {renderFAQContent(faq.answer_html || '')}
                  </Accordion>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    scrollToTop={true}
                  />
                </div>
              )}

              {/* FAQ Count */}
              {totalPages > 1 && (
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, filteredFaqs.length)}{' '}
                    of {filteredFaqs.length} FAQs
                  </p>
                </div>
              )}
            </>
          ) : (
            <NoData
              message={
                searchQuery
                  ? 'No FAQs match your search. Try different keywords.'
                  : 'No FAQs available at the moment.'
              }
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
