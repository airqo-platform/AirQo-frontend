'use client';

import React from 'react';

/**
 * Simple test HOC for debugging
 */
const withTestAuthRoute = (Component) => {
  const TestComponent = (props) => {
    return <Component {...props} />;
  };

  TestComponent.displayName = `withTestAuthRoute(${Component.displayName || Component.name || 'Component'})`;

  return TestComponent;
};

export default withTestAuthRoute;
