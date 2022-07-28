import React from 'react'
import { Helmet } from "react-helmet";

const SEO = ({ title, description, siteTitle }) => {
    return (
        <div>
            <Helmet>
                <title>{`${title} | ${siteTitle}`}</title>
                <meta name="description" content={description}></meta>
                <meta property="og:type" content="website" />
                <meta name="og:title" content={`${title} | ${siteTitle}`} />
                <meta name="og:site_name" content={siteTitle} />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
                <meta property="og:url" content="https://www.airqo.net" />
                <meta property="og:image" content="assets/opengraph.png" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#000000" />
            </Helmet>
        </div>
    );
};

export default SEO;