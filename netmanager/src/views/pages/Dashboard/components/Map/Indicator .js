import React from 'react';
// Icons
import Good from 'views/components/MapIcons/Good';
import Moderate from 'views/components/MapIcons/Moderate';
import Unhealthy from 'views/components/MapIcons/Unhealthy';
import UnhealthySensitive from 'views/components/MapIcons/UnhealthySen';
import VeryUnhealthy from 'views/components/MapIcons/VeryUnhealthy';
import Hazardous from 'views/components/MapIcons/Hazardous';
import Offline from 'views/components/MapIcons/Offline';

const Tooltip = ({ children, text, icon, label }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div
      className="air-quality-description"
      style={{ position: 'relative', outline: 'none', border: 'none', margin: '13px 0' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}>
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            border: 'none   ',
            outline: 'none',
            borderRadius: '8px',
            left: '50%',
            transform: 'translate(-50%)',
            backgroundColor: 'white',
            padding: '10px',
            maxHeight: '200px',
            maxWidth: '200px',
            minWidth: '180px',
            overflow: 'auto'
          }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: '8px',
              backgroundColor: icon.props.fill,
              padding: '5px',
              height: 'auto',
              margin: '0 0 10px 0'
            }}>
            {React.cloneElement(icon, { fill: 'black' })}
            <p
              style={{
                fontWeight: 'bold',
                fontSize: '12px'
              }}>
              {label}
            </p>
          </div>
          <p
            style={{
              fontFamily: 'Roboto'
            }}>
            {text}
          </p>
        </div>
      )}
      {children}
    </div>
  );
};

const Indicator = () => {
  const [showIndicator, setShowIndicator] = React.useState(true);
  return (
    <div>
      {showIndicator && (
        <div className="indicator">
          <Tooltip
            label="Good"
            text="Air is clean and poses no health risks."
            icon={<Good width={30} height={30} fill="#45e50d" />}>
            <span className="good">Good</span>
          </Tooltip>
          <Tooltip
            label="Moderate"
            text="Air quality is fair, but pollutants might affect sensitive individuals."
            icon={<Moderate width={30} height={30} fill="#f8fe28" />}>
            <span className="moderate">Moderate</span>
          </Tooltip>
          <Tooltip
            label="Unhealthy for Sensitive Groups"
            text="Air quality could impact health of sensitive groups. General public is not likely affected."
            icon={<UnhealthySensitive width={30} height={30} fill="#ee8310" />}>
            <span className="unhealthy-sensitive">Unhealthy for Sensitive Groups</span>
          </Tooltip>
          <Tooltip
            label="Unhealthy"
            text="Health effects may be felt by everyone; sensitive groups may experience more severe effects."
            icon={<Unhealthy width={30} height={30} fill="#fe0000" />}>
            <span className="unhealthy">Unhealthy</span>
          </Tooltip>
          <Tooltip
            label="Very Unhealthy"
            text="Health alert: everyone may experience serious health effects."
            icon={<VeryUnhealthy width={30} height={30} fill="#8639c0" />}>
            <span className="very-unhealthy">Very Unhealthy</span>
          </Tooltip>
          <Tooltip
            label="Hazardous"
            text="Health warning of emergency conditions: severe impact on entire population."
            icon={<Hazardous width={30} height={30} fill="#81202e" />}>
            <span className="hazardous">Hazardous</span>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default Indicator;
