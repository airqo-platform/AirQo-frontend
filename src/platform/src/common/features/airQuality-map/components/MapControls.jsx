import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '../hooks';

// Icons
import LayerIcon from '@/icons/map/layerIcon';
import RefreshIcon from '@/icons/map/refreshIcon';
import ShareIcon from '@/icons/map/shareIcon';
import CameraIcon from '@/icons/map/cameraIcon';
import DotsVerticalIcon from '@/icons/map/dotsVerticalIcon';

const DesktopControls = ({ onControlAction }) => (
  <div className="flex flex-col gap-4">
    <IconButton
      onClick={() => onControlAction('refresh')}
      title="Refresh Map"
      icon={<RefreshIcon />}
    />
    <IconButton
      onClick={() => onControlAction('share')}
      title="Share Location"
      icon={<ShareIcon />}
    />
    <IconButton
      onClick={() => onControlAction('capture')}
      title="Capture Screenshot"
      icon={<CameraIcon />}
    />
    <IconButton
      onClick={() => onControlAction('layers')}
      title="Map Layers"
      icon={<LayerIcon />}
    />
  </div>
);

const MobileControls = ({
  isControlsExpanded,
  setIsControlsExpanded,
  onControlAction,
}) => (
  <div className="relative controls-container">
    <div className="flex items-center">
      {isControlsExpanded && (
        <div
          className={`
            absolute right-full mr-2 flex gap-2 z-50
            transform transition-all duration-200 ease-in-out
            ${isControlsExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}
          `}
        >
          <IconButton
            onClick={() => onControlAction('refresh')}
            title="Refresh Map"
            icon={<RefreshIcon />}
          />
          <IconButton
            onClick={() => onControlAction('share')}
            title="Share Location"
            icon={<ShareIcon />}
          />
          <IconButton
            onClick={() => onControlAction('capture')}
            title="Capture Screenshot"
            icon={<CameraIcon />}
          />
        </div>
      )}
      <IconButton
        onClick={() => setIsControlsExpanded(!isControlsExpanded)}
        title="Map Controls"
        icon={<DotsVerticalIcon />}
      />
    </div>
  </div>
);

const MapControls = ({
  isDesktop,
  isControlsExpanded,
  setIsControlsExpanded,
  onControlAction,
  show = true,
}) => {
  if (!show) return null;

  return (
    <div className="absolute top-4 right-0 controls-container z-50">
      {isDesktop ? (
        <DesktopControls onControlAction={onControlAction} />
      ) : (
        <MobileControls
          isControlsExpanded={isControlsExpanded}
          setIsControlsExpanded={setIsControlsExpanded}
          onControlAction={onControlAction}
        />
      )}
    </div>
  );
};

DesktopControls.propTypes = {
  onControlAction: PropTypes.func.isRequired,
};

MobileControls.propTypes = {
  isControlsExpanded: PropTypes.bool.isRequired,
  setIsControlsExpanded: PropTypes.func.isRequired,
  onControlAction: PropTypes.func.isRequired,
};

MapControls.propTypes = {
  isDesktop: PropTypes.bool.isRequired,
  isControlsExpanded: PropTypes.bool.isRequired,
  setIsControlsExpanded: PropTypes.func.isRequired,
  onControlAction: PropTypes.func.isRequired,
  show: PropTypes.bool,
};

export default MapControls;
