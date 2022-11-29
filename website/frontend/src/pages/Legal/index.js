import React, { useState } from 'react';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import Page from '../Page';

const LegalPage = () => {
  const [selectedTab, setSelectedTab] = useState('TermsOfService');
  const onClickTabItem = (tab) => setSelectedTab(tab);

  return (
    <Page>
      <div className="tos-page">
        <div className="tos-header">
          <div className="content">
            <div className="tos-top">
              <h2>Legal</h2>
              <div className="header-nav">
                <span id="tab1">
                  <button
                    className={selectedTab === 'TermsOfService' ? 'selected' : 'unselected'}
                    onClick={() => onClickTabItem('TermsOfService')}>
                    Terms of Service
                  </button>
                </span>
                <span id="tab2">
                  <button
                    className={selectedTab === 'PrivacyPolicy' ? 'selected' : 'unselected'}
                    onClick={() => onClickTabItem('PrivacyPolicy')}>
                    Privacy Policy
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
        {selectedTab === 'TermsOfService' ? <TermsOfService /> : <PrivacyPolicy />}
      </div>
    </Page>
  );
};

export default LegalPage;
