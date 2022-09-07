import React from 'react'
import { Helmet } from "react-helmet";

const SEO = ({ title, description, siteTitle }) => {
    return (
        <div>
            <Helmet>
                <title>{`${title} | ${siteTitle}`}</title>
                <meta name="description" content={description}></meta>
                <meta name="og:title" content={`${title} | ${siteTitle}`} />
                <meta name="og:site_name" content={siteTitle} />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
            </Helmet>
        </div>
    );
};

export default SEO;