import React from 'react';
import Page from '../Page';
import Header from '../../components/OurProducts/Header';
import { useInitScrollTop } from 'utils/customHooks';

const ApiPage = () => {
  useInitScrollTop();
  return (
    <Page>
      <div className="product-page api">
        <Header
          pageTitle={'AirQo API'}
          title={'Access air quality data through our API'}
          subText={
            'The AirQo API provides access to air quality data collected from the AirQo network of low-cost air quality monitors deployed across different African cities. The API is free to use and does not require authentication.'
          }>
          <img
            src="
            https://images.unsplash.com/photo-1573164573938-c9a3db2e84ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80
          "
            alt=""
          />
        </Header>
        <div className="content">
          <div className="section"></div>
          <div className="section"></div>
          <div className="section"></div>
        </div>
      </div>
    </Page>
  );
};

export default ApiPage;
