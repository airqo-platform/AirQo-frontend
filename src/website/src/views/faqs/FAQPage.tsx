'use client';

import DOMPurify from 'dompurify';
import React, { useEffect, useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

import { Accordion, Button, Input, NoData } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { useFAQs } from '@/hooks/useApiHooks';
import { FAQ } from '@/types';
import { sanitizeAndCleanHTML } from '@/utils/htmlValidator';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [openAccordionId, setOpenAccordionId] = useState<number | null>(null);
  const itemsPerPage = 20;

  const {
    data,
    isLoading,
    error: isError,
  } = useFAQs({
    page,
    page_size: itemsPerPage,
  });

  useEffect(() => {
    if (data) {
      if (data.results) {
        setFaqs((prev) => {
          const newFaqs = data.results.filter((f: any) => f.is_active);
          // Avoid duplicates
          const existingIds = new Set(prev.map((f) => f.id));
          const uniqueNewFaqs = newFaqs.filter(
            (f: any) => !existingIds.has(f.id),
          );
          return [...prev, ...uniqueNewFaqs];
        });
      }
      if (data.total_pages) {
        setTotalPages(data.total_pages);
      }
    }
  }, [data]);

  // Extract unique categories
  const categories = [
    'All',
    ...Array.from(new Set(faqs.map((f) => f.category_name).filter(Boolean))),
  ];

  // Filter by category and search query
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filtered = faqs.filter((f) => {
    const matchesCategory =
      selectedCategory === 'All' || f.category_name === selectedCategory;
    const q = (f.question || '').toLowerCase();
    const a = (f.answer || '').toLowerCase();
    const ah = (f.answer_html || '').toLowerCase();
    const matchesSearch =
      !normalizedQuery ||
      q.includes(normalizedQuery) ||
      a.includes(normalizedQuery) ||
      ah.includes(normalizedQuery);

    return matchesCategory && matchesSearch;
  });

  const faqsList = filtered;
  const totalCount = filtered.length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setOpenAccordionId(null); // Close any open accordion when searching
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setOpenAccordionId(null);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setOpenAccordionId(null);
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handleAccordionToggle = (faqId: number) => {
    setOpenAccordionId(openAccordionId === faqId ? null : faqId);
  };

  // (server-side search is used) -- local stripHtml no longer required

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
    const safeHtml = sanitizeAndCleanHTML(answerHtml || '', {
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
                  {totalCount === 0
                    ? 'No FAQs found matching your search'
                    : `${totalCount} FAQ${totalCount !== 1 ? 's' : ''} found`}
                </p>
              </div>
            )}
          </div>

          {/* Category Tabs */}
          {!isLoading && categories.length > 1 && (
            <div className="mb-8 overflow-x-auto">
              <div className="flex space-x-6 border-b border-gray-200 min-w-max">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`capitalize pb-3 text-sm font-medium transition-colors relative ${
                      selectedCategory === category
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {category === 'All' ? 'All Questions' : category}
                    {selectedCategory === category && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && faqs.length === 0 ? (
            <div className="w-full">
              {[...Array(5)].map((_, index) => (
                <FAQSkeleton key={index} />
              ))}
            </div>
          ) : isError && faqs.length === 0 ? (
            <NoData message="Failed to load FAQs. Please try again later." />
          ) : faqsList.length > 0 ? (
            <>
              {/* FAQ List */}
              <div className="w-full">
                {faqsList.map((faq: FAQ) => (
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

              {/* Load More Button */}
              {(page < totalPages || (isLoading && page > 1)) && (
                <div className="mt-8 flex justify-center">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="px-8 py-3 bg-blue-600 text-white  hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </Button>
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
