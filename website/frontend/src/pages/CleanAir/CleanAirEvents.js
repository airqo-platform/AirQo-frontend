import React from 'react';
import SEO from 'utilities/seo';
import { useDispatch } from 'react-redux';
import { SplitSection, SingleSection } from 'components/CleanAir';

const CleanAirEvents = () => {
  return (
    <div>
      <SEO
        title="CLEAN-Air Africa Network | Events"
        siteTitle="CLEAN-Air Africa Network"
        description="CLEAN-Air Africa Network is a network of African cities, governments, and partners committed to improving air quality and reducing carbon emissions through sustainable transport and mobility solutions."
      />

      <div className="partners">
        <div className="partners-wrapper">
          <p className="partners-intro">
            As the CLEAN-Air Africa Network, we are all about creating engagement around air quality
            management across Africa.
            <br />
            <br />
            We promote sustainability activities, provide handy resources, connect a wide pool of
            experts and feature events.
          </p>
        </div>
      </div>

      <div></div>
    </div>
  );
};

export default CleanAirEvents;
