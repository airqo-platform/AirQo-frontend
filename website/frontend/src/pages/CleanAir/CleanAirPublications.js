import React, { useEffect, useState } from 'react';
import SEO from 'utilities/seo';
import { useInitScrollTop } from 'utilities/customHooks';
import { isEmpty } from 'underscore';
import { useDispatch, useSelector } from 'react-redux';

const CleanAirPublications = () => {
  useInitScrollTop();
  const dispatch = useDispatch();
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
      work in progress
    </div>
  );
};

export default CleanAirPublications;
