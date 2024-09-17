import React from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';

const SEO = ({
  title,
  description,
  siteTitle,
  canonicalUrls = [],
  image,
  article,
  keywords,
  lang = 'en'
}) => {
  const seo = {
    title: title || siteTitle,
    description: description,
    urls:
      canonicalUrls.length > 0
        ? canonicalUrls
        : [typeof window !== 'undefined' ? window.location.href : ''],
    image: image
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
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:site_name" content={siteTitle} />
      {seo.image && <meta property="og:image" content={seo.image} />}
      {seo.urls[0] && <meta property="og:url" content={seo.urls[0]} />}{' '}
      {/* Use the first canonical URL for OG URL */}
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      {seo.image && <meta name="twitter:image" content={seo.image} />}
      {/* Canonical URLs */}
      {seo.urls.map((url, index) => (
        <link key={index} rel="canonical" href={url} />
      ))}
      {/* JSON-LD structured data */}
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "${article ? 'Article' : 'WebPage'}",
            "headline": "${seo.title}",
            "description": "${seo.description}",
            "image": "${seo.image || ''}",
            "url": "${seo.urls[0]}"
          }
        `}
      </script>
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  siteTitle: PropTypes.string.isRequired,
  canonicalUrls: PropTypes.arrayOf(PropTypes.string),
  image: PropTypes.string,
  article: PropTypes.bool,
  keywords: PropTypes.string,
  lang: PropTypes.string
};

export default SEO;
