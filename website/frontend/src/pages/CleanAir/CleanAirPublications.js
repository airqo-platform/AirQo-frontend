import React, { useEffect, useState } from 'react';
import SEO from 'utilities/seo';
import { useInitScrollTop } from 'utilities/customHooks';
import { isEmpty } from 'underscore';
import { useDispatch, useSelector } from 'react-redux';

const CleanAirPublications = () => {
  useInitScrollTop();
  const dispatch = useDispatch();
  return (
    <div>
      <SEO
        title="CLEAN-Air Africa Network | Partners"
        siteTitle="CLEAN-Air Africa Network"
        description="CLEAN-Air Africa Network is a network of African cities and partners committed to improving air quality and reducing carbon emissions through knowledge sharing and capacity building."
      />

      <div className="partners">
        <div className="partners-wrapper">hello</div>
      </div>
    </div>
  );
};

export default CleanAirPublications;
