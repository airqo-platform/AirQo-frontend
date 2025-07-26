import React, { useState } from 'react';
import {
  WalkthroughProvider,
  WalkthroughTour,
} from '../components/Walkthrough';

export default function BasicExample() {
  const [isTourActive, setIsTourActive] = useState(false);
  const steps = [
    {
      id: 'welcome',
      target: '.welcome-section',
      title: 'Welcome to Our App!',
      content: 'This is where your journey begins. Let us show you around!',
    },
    {
      id: 'navigation',
      target: '.navigation-menu',
      title: 'Navigation Menu',
      content:
        'Use this menu to navigate between different sections of the app.',
      placement: 'bottom',
    },
    {
      id: 'search',
      target: '.search-box',
      title: 'Search Functionality',
      content: 'Search for anything you need using this powerful search box.',
      placement: 'left',
    },
    {
      id: 'profile',
      target: '.profile-button',
      title: 'Your Profile',
      content: 'Access your profile settings and preferences here.',
      placement: 'bottom',
    },
  ];
  const handleTourComplete = () => {
    setIsTourActive(false);
    localStorage.setItem('tour-completed', 'true');
  };
  const handleTourSkip = () => {
    setIsTourActive(false);
    // User skipped the tour
  };
  return (
    <WalkthroughProvider>
      <div className="app">
        <header className="header">
          <nav className="navigation-menu">
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </nav>
          <div className="search-box">
            <input type="text" placeholder="Search..." />
          </div>
          <button className="profile-button">Profile</button>
        </header>
        <main className="main-content">
          <section className="welcome-section">
            <h1>Welcome to Our Amazing App!</h1>
            <p>Get started by taking our interactive tour.</p>
            <button
              onClick={() => setIsTourActive(true)}
              className="start-tour-button"
            >
              Start Tour
            </button>
          </section>
        </main>
        <WalkthroughTour
          steps={steps}
          isActive={isTourActive}
          configuration={{
            theme: 'default',
            showProgress: true,
            showSkipButton: true,
          }}
          onTourComplete={handleTourComplete}
          onTourSkip={handleTourSkip}
          onStepChange={() => {
            // Step changed
          }}
        />
      </div>
    </WalkthroughProvider>
  );
}
