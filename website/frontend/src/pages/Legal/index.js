import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import AirQoData from './AirQo_Data';
import AirQoPayments from './AirQo_Payments';
import Page from '../Page';

const TabButton = ({ label, isSelected, onClick }) => (
  <button className={`tab-button ${isSelected ? 'selected' : ''}`} onClick={onClick}>
    {label}
  </button>
);

const LegalPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('terms');

  const tabs = [
    { id: 'terms', label: 'Terms of Service', component: TermsOfService },
    { id: 'privacy', label: 'Privacy Policy', component: PrivacyPolicy },
    { id: 'airqoData', label: 'AirQo Data', component: AirQoData },
    { id: 'airqoPayments', label: 'Payment Terms & Refund Policy', component: AirQoPayments }
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    if (tabFromUrl && tabs.some((tab) => tab.id === tabFromUrl)) {
      setSelectedTab(tabFromUrl);
    } else {
      setSelectedTab('terms');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  const handleTabChange = (tabId) => {
    setSelectedTab(tabId);
    navigate(`/legal?tab=${tabId}`, { replace: true });
  };

  const SelectedComponent = tabs.find((tab) => tab.id === selectedTab)?.component || TermsOfService;

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
                onClick={() => handleTabChange(tab.id)}
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
