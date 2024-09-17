import React from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';

const SEO = ({
  title,
  description,
  siteTitle,
  canonicalUrl,
  image,
  article,
  keywords,
  lang = 'en',
  author,
  datePublished,
  dateModified,
  organizationName,
  organizationLogo
}) => {
  const seo = {
    title: title || siteTitle,
    description: description,
    url: canonicalUrl || (typeof window !== 'undefined' ? window.location.href : ''),
    image: image || '',
    author: author || organizationName,
    datePublished: datePublished,
    dateModified: dateModified
  };

  const schemaOrgWebPage = {
    '@context': 'https://schema.org',
    '@type': article ? 'Article' : 'WebPage',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': seo.url
    },
    headline: seo.title,
    description: seo.description,
    image: seo.image,
    author: {
      '@type': 'Person',
      name: seo.author
    },
    datePublished: seo.datePublished,
    dateModified: seo.dateModified,
    publisher: {
      '@type': 'Organization',
      name: organizationName,
      logo: {
        '@type': 'ImageObject',
        url: organizationLogo
      }
    }
  };

  return (
    <Helmet
      htmlAttributes={{
        lang
      }}
      title={seo.title}
      titleTemplate={`%s | ${siteTitle}`}>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={seo.author} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:site_name" content={siteTitle} />
      {seo.image && <meta property="og:image" content={seo.image} />}
      {seo.url && <meta property="og:url" content={seo.url} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      {seo.image && <meta name="twitter:image" content={seo.image} />}

      {/* Additional SEO-friendly meta tags */}
      <meta name="robots" content="index, follow" />
      <meta
        name="googlebot"
        content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      />
      <meta
        name="bingbot"
        content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      />

      {/* Canonical URL */}
      {seo.url && <link rel="canonical" href={seo.url} />}

      {/* JSON-LD structured data */}
      <script type="application/ld+json">{JSON.stringify(schemaOrgWebPage)}</script>
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  siteTitle: PropTypes.string.isRequired,
  canonicalUrl: PropTypes.string,
  image: PropTypes.string,
  article: PropTypes.bool,
  keywords: PropTypes.string,
  lang: PropTypes.string,
  author: PropTypes.string,
  datePublished: PropTypes.string,
  dateModified: PropTypes.string,
  organizationName: PropTypes.string,
  organizationLogo: PropTypes.string
};

export default SEO;
