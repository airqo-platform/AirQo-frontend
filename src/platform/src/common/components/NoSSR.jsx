'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * NoSSR Component - Prevents server-side rendering for wrapped content
 *
 * This component ensures that children are only rendered on the client-side,
 * preventing hydration mismatches and SSR errors with Redux and other
 * client-only dependencies.
 */
function NoSSR({ children, fallback = null }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return fallback;
  }

  return children;
}

NoSSR.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
};

export default NoSSR;
