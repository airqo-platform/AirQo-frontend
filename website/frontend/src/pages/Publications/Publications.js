import React from 'react';
import SEO from 'utils/seo';
import Page from '../Page';
import CardComponent from './CardComponent';

const PublicationsPage = () => {
  return (
    <Page>
      <div className="list-page">
        <SEO
          title="Publications"
          siteTitle="AirQo Publications"
          description="AirQo drives research conversations in the air quality space"
        />
        <div className="page-header">
          <div className="content">
            <div className="title-wrapper">
              <h2>Publications</h2>
              <span className="sub-title">
                Discover our latest collection of research publications
              </span>
            </div>
          </div>
        </div>
        <div className="page-body">
          <div className="content">
            <div className="list-cards">
              <div className="card">
                <CardComponent/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default PublicationsPage;
