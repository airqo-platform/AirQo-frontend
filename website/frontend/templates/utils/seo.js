import React from 'react'
import { Helmet } from "react-helmet";

const SEO = ({ title, description, siteTitle }) => {
    return (
      <div>
        <Helmet>
          <title>{`${title} | ${siteTitle}`}</title>
          <meta name="description" content={description}></meta>
          <meta property="og:type" content="website.page" />
          <meta property="og:description" content={description}></meta>
          <meta property="og:title" content={`${title} | ${siteTitle}`} />
          <meta property="og:site_name" content={siteTitle} />
          <meta property="og:url" content={window.location.href} />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
        </Helmet>
      </div>
    );
};

export default SEO;