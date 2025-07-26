import React, { useState, useEffect } from 'react';
import { WalkthroughProvider, useWalkthrough } from '../components/Walkthrough';

function AdvancedTourComponent() {
  const {
    isActive,
    currentStep,
    currentStepData,
    totalSteps,
    startTour,
    endTour,
    nextStep,
    previousStep,
    addStep,
    isFirstStep,
    isLastStep,
  } = useWalkthrough();
  const [userRole, setUserRole] = useState('user');
  const baseSteps = useMemo(
    () => [
      {
        id: 'dashboard',
        target: '.dashboard-section',
        title: 'Dashboard Overview',
        content:
          'This is your main dashboard where you can see all important metrics.',
        showBeacon: true,
      },
      {
        id: 'reports',
        target: '.reports-button',
        title: 'Reports',
        content: 'Generate and view detailed reports about your data.',
        placement: 'right',
      },
    ],
    [],
  );
  const adminSteps = useMemo(
    () => [
      {
        id: 'admin-panel',
        target: '.admin-panel',
        title: 'Admin Panel',
        content:
          'As an admin, you have access to advanced management features.',
        customClass: 'admin-step',
      },
      {
        id: 'user-management',
        target: '.user-management',
        title: 'User Management',
        content: 'Manage users, permissions, and access levels from here.',
        blockInteraction: true,
      },
    ],
    [],
  );
  const startAdvancedTour = useCallback(() => {
    const steps = [...baseSteps];
    if (userRole === 'admin') {
      steps.push(...adminSteps);
    }
    steps.push({
      id: 'personalized-end',
      target: '.finish-area',
      title: `Welcome ${userRole === 'admin' ? 'Admin' : 'User'}!`,
      content: `You're all set up! ${userRole === 'admin' ? 'You have full admin access.' : 'Enjoy using the app!'}`,
    });
    startTour(steps, {
      theme: userRole === 'admin' ? 'dark' : 'material',
      customStyles: {
        tooltip: {
          maxWidth: '350px',
          ...(userRole === 'admin' && {
            border: '2px solid #ff6b6b',
          }),
        },
      },
      responsive: {
        mobile: {
          maxWidth: '300px',
          showProgress: false,
        },
      },
    });
  }, [baseSteps, adminSteps, userRole, startTour]);
  const handleDynamicStepAddition = () => {
    if (isActive) {
      addStep(
        {
          id: 'dynamic-feature',
          target: '.new-feature',
          title: 'New Feature Alert!',
          content: 'This step was added dynamically based on your interaction.',
        },
        currentStep + 1,
      );
    }
  };
  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`tour-seen-${userRole}`);
    if (!hasSeenTour) {
      setTimeout(() => startAdvancedTour(), 1000);
    }
  }, [userRole, startAdvancedTour]);
  return (
    <div className="advanced-example">
      <div className="controls">
        <button onClick={startAdvancedTour}>
          Start {userRole === 'admin' ? 'Admin' : 'User'} Tour
        </button>
        <button
          onClick={() => setUserRole(userRole === 'user' ? 'admin' : 'user')}
        >
          Switch to {userRole === 'user' ? 'Admin' : 'User'}
        </button>
        {isActive && (
          <button onClick={handleDynamicStepAddition}>Add Dynamic Step</button>
        )}
      </div>
      {isActive && (
        <div className="tour-status">
          <p>
            Tour Active: Step {currentStep + 1} of {totalSteps}
          </p>
          <p>Current Step: {currentStepData?.title}</p>
          <div className="manual-controls">
            <button onClick={previousStep} disabled={isFirstStep}>
              Previous
            </button>
            <button onClick={nextStep} disabled={isLastStep}>
              Next
            </button>
            <button onClick={endTour}>End Tour</button>
          </div>
        </div>
      )}
      <main className="app-content">
        <section className="dashboard-section">
          <h2>Dashboard</h2>
          <div className="metrics">
            <div className="metric">Users: 1,234</div>
            <div className="metric">Revenue: $12,345</div>
          </div>
        </section>
        <nav className="sidebar">
          <button className="reports-button">Reports</button>
          {userRole === 'admin' && (
            <>
              <button className="admin-panel">Admin Panel</button>
              <button className="user-management">User Management</button>
            </>
          )}
        </nav>
        <div className="new-feature" style={{ display: 'none' }}>
          New Feature Area
        </div>
        <div className="finish-area">
          <p>Tour completion area</p>
        </div>
      </main>
    </div>
  );
}
export default function AdvancedExample() {
  return (
    <WalkthroughProvider
      defaultConfiguration={{
        keyboardNavigation: true,
        scrollBehavior: 'smooth',
        showProgress: true,
        completionDelay: 2000,
      }}
    >
      <AdvancedTourComponent />
    </WalkthroughProvider>
  );
}
