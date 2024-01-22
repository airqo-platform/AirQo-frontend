import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useInitScrollTop } from 'utilities/customHooks';
import { loadCareersListingData } from 'reduxStore/Careers/operations';
import { useCareerListingData, useCareerLoadingData } from 'reduxStore/Careers/selectors';
import { isEmpty } from 'underscore';
import Loadspinner from 'src/components/LoadSpinner';
import PageMini from './PageMini';
import { useTranslation, Trans } from 'react-i18next';

const BulletList = ({ name, bullets }) => (
  <ul className="list">
    <span>{name}</span>
    {(bullets || []).map((value, key) => (
      <li key={key}>{value.point}</li>
    ))}
  </ul>
);

const CareerDetailPage = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  const { uniqueTitle } = useParams();
  const dispatch = useDispatch();
  const careerListing = useCareerListingData();
  const loading = useCareerLoadingData();
  const listing = careerListing[uniqueTitle] || {};

  useEffect(() => {
    if (isEmpty(careerListing)) dispatch(loadCareersListingData());
  }, []);

  return (
    <PageMini>
      {loading && <Loadspinner />}
      {!loading && isEmpty(listing) && (
        <div className="careers-detail--no-listing">
          {t('about.careers.careerDetails.noListing')}
        </div>
      )}
      {!loading && !isEmpty(listing) && (
        <div className="DetailPage">
          <div className="content">
            <header className="title">
              <span>{listing.title}</span>
              <span>
                {listing.department && listing.department.name} / {listing.type}
              </span>
            </header>
            {(listing.descriptions || []).map((value, key) => (
              <p className="description" key={key}>
                {value.description}
              </p>
            ))}
            {(listing.bullets || []).map((value, key) => (
              <BulletList key={key} name={value.name} bullets={value.bullet_points} />
            ))}

            {/* eslint-disable-next-line react/button-has-type */}
            {listing.apply_url && (
              <a target="_blank" href={listing.apply_url} rel="noreferrer">
                <button className="button-hero">{t('about.careers.careerDetails.cta')}</button>
              </a>
            )}
          </div>
        </div>
      )}
    </PageMini>
  );
};

export default CareerDetailPage;
