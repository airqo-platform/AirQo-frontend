import React, { useState, useEffect } from 'react';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import AirQoData from './AirQo_Data';
import Page from '../Page';

const TabButton = ({ label, isSelected, onClick }) => (
  <button className={`tab-button ${isSelected ? 'selected' : ''}`} onClick={onClick}>
    {label}
  </button>
);

const LegalPage = () => {
  const [selectedTab, setSelectedTab] = useState('TermsOfService');

  const tabs = [
    { id: 'TermsOfService', label: 'Terms of Service', component: TermsOfService },
    { id: 'PrivacyPolicy', label: 'Privacy Policy', component: PrivacyPolicy },
    { id: 'AirQoData', label: 'AirQo Data', component: AirQoData }
  ];

  const SelectedComponent = tabs.find((tab) => tab.id === selectedTab).component;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <Page>
      <div className="tos-header">
        <div className="header-body">
          <h1 className="page-title">Legal Information</h1>
          <div className="tabs">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                label={tab.label}
                isSelected={selectedTab === tab.id}
                onClick={() => setSelectedTab(tab.id)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="legal-page">
        <div className="container">
          <div className="content-wrapper">
            <div className="tab-content">
              <SelectedComponent />
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default LegalPage;
