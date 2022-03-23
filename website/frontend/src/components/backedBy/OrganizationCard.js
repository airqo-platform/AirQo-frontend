import React from 'react';
import PropTypes from 'prop-types';

// Assets
import BackingOrg from '../../assets/img/OrganizationImage.svg';
import OrganizationLogo from '../../icons/homepage/partners/google.svg';

export default function OrganisationCard({
  imageUrl, logoUrl, heading, paragraph,
}) {
  return (
    <div id="card-content">
        <div id="org-image">
            { imageUrl ? <img alt="organization-imageUrl" src={imageUrl} /> : <BackingOrg />}
        </div>
        <div className="card-text">
            <p className="card-heading">{heading}</p>
            <p>{paragraph}</p>
        </div>
        <div id="org-logo">
            { logoUrl ? <img alt="organization-imageUrl" src={logoUrl} /> : <OrganizationLogo />}
        </div>
    </div>
  );
}

OrganisationCard.propTypes = {
  imageUrl: PropTypes.string,
  heading: PropTypes.string,
  paragraph: PropTypes.string,
  logoUrl: PropTypes.string,
};

OrganisationCard.defaultProps = {
  imageUrl: false,
  heading: '',
  paragraph: '',
  logoUrl: false,
};
