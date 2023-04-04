import React from 'react';
import Page from '../Page';
import { useInitScrollTop } from 'utils/customHooks';

const MobileAppPage = () => {
  useInitScrollTop();
  return (
    <Page>
      <div className="product-page mobile-app"></div>
    </Page>
  );
};

export default MobileAppPage;
