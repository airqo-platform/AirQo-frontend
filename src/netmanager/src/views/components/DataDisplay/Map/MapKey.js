import React, { useState } from 'react';
import ReactTooltip from 'react-tooltip';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import Hidden from '@material-ui/core/Hidden';

import 'assets/scss/device-management-map.sass';

const MobileLabel = ({ label }) => {
  return (
    <Hidden smUp>
      <span style={{ fontSize: '0.6rem' }}>{label}</span>
    </Hidden>
  );
};

export const MapKey = ({ title }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="filter_1">
        <h2
          className="filter__h2"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
            textTransform: 'uppercase',
            height: '30px',
            minWidth: '100px'
          }}
          onClick={toggleIsOpen}>
          <span>{title || 'map key'}</span>
          <div className={'mapkey-icon-container'} onClick={toggleIsOpen}>
            {isOpen ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </div>
        </h2>
        {isOpen && (
          <div className={'mapkey-container'}>
            <div>
              <span>Outer Ring</span>
              <label>
                <div className={'ring bd-success'} data-tip data-for="m-good" />
                <ReactTooltip id="m-good" place="right" effect="solid">
                  Maintenance status - good
                </ReactTooltip>
              </label>
              <MobileLabel label={'Maintenance status - good'} />
              <label>
                <div className={'ring bd-warning'} data-tip data-for="m-due" />
                <ReactTooltip id="m-due" place="right" effect="solid">
                  Maintenance status - due
                </ReactTooltip>
              </label>
              <MobileLabel label={'Maintenance status - due'} />
              <label>
                <div className={'ring bd-danger'} data-tip data-for="m-overdue" />
                <ReactTooltip id="m-overdue" place="right" effect="solid">
                  Maintenance status - overdue
                </ReactTooltip>
              </label>
              <MobileLabel label={'Maintenance status - overdue'} />
              <label>
                <div className={'ring bd-grey'} data-tip data-for="m-notset" />
                <ReactTooltip id="m-notset" place="right" effect="solid">
                  Maintenance status - not set
                </ReactTooltip>
              </label>
              <MobileLabel label={'Maintenance status - not set'} />
            </div>
            <div>
              <span>Inner Circle</span>
              <label>
                <div className={'circle b-info'} data-tip data-for="d-online" />
                <ReactTooltip id="d-online" place="right" effect="solid">
                  Device status - online
                </ReactTooltip>
              </label>
              <MobileLabel label={'Device status - online'} />
              <label>
                <div className={'circle b-grey'} data-tip data-for="d-offline" />
                <ReactTooltip id="d-offline" place="right" effect="solid">
                  Device status - offline
                </ReactTooltip>
              </label>
              <MobileLabel label={'Device status - offline'} />
            </div>
            <div>
              <span>Examples</span>
              <label>
                <div className={'ring b-info bd-grey'} data-tip data-for="example-1" />
                <ReactTooltip id="example-1" place="right" effect="solid">
                  Device is online but maintenance date is not set
                </ReactTooltip>
              </label>
              <MobileLabel label={'Device is online but maintenance date is not set'} />
              <label>
                <div className={'ring b-grey bd-success'} data-tip data-for="example-2" />
                <ReactTooltip id="example-2" place="right" effect="solid">
                  Device is offline but maintenance is not due (good)
                </ReactTooltip>
              </label>
              <MobileLabel label={'Device is offline but maintenance is not due (good)'} />
              <label>
                <div className={'ring b-info bd-danger'} data-tip data-for="example-3" />
                <ReactTooltip id="example-3" place="right" effect="solid">
                  Device is online but maintenance is overdue
                </ReactTooltip>
              </label>
              <MobileLabel label={'Device is online but maintenance is overdue'} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
