import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

export default function ResponsivePortal({
  children,
  containerId = 'walkthrough-portal',
}) {
  const [portalContainer, setPortalContainer] = useState(null);

  useEffect(() => {
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.className = 'walkthrough-portal';
      document.body.appendChild(container);
    }
    setPortalContainer(container);
    return () => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, [containerId]);

  if (!portalContainer) {
    return null;
  }

  return createPortal(children, portalContainer);
}

ResponsivePortal.propTypes = {
  children: PropTypes.node.isRequired,
  containerId: PropTypes.string,
};
