import React from 'react';
import PropTypes from 'prop-types';
import { Maximize } from '@material-ui/icons';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

// Components
import OrganisationCard from './OrganizationCard';

const responsive = {
  superLargeDesktop: { breakpoint: { max: 4000, min: 3000 }, items: 5 },
  desktop: { breakpoint: { max: 3000, min: 1024 }, items: 2 },
  tablet: { breakpoint: { max: 1024, min: 464 }, items: 2 },
  mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
};

const cards = Array(6).fill(
    <OrganisationCard
      imageUrl={false}
      logo={false}
      heading="Meet the research team using Ai to reduce air pollution in Uganda."
      paragraph="For Engineer Bainomugisha and the Makerere University team, grantees
                of the Google AI Impact Challenge... Read more"
    />,
);

const CustomDot = ({
  onClick,
  active,
}) => (
    <Maximize
      className="custom-dot"
      style={{ background: `${active ? '#145DFF' : '#FFFFFF'}` }}
      onClick={() => onClick()}
    />
);

CustomDot.propTypes = {
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired,
};

export default function BackedBy() {
  return (
    <div className="backed-by">
        <span className="backed-by-title">
            Backed by strong global organisations and institutions
        </span>
        <div className="backed-by-subheading">
            <p>
                AirQo is backed by notable organisations as well as government institutions
            </p>
        </div>
        <div className="backed-by-buttons">
            <button type="button" id="request-demo">Request a Demo</button>
            <button type="button" id="get-involved">Get involved</button>
        </div>
        <Carousel
          responsive={responsive}
          itemClass="org-card"
          containerClass="carousel-container carousel"
          removeArrowOnDeviceType={['superLargeDesktop', 'desktop', 'tablet', 'mobile']}
          slidesToSlide={1}
          swipeable
          customDot={<CustomDot />}
          renderDotsOutside
          showDots
          autoPlay
        >
            {cards}
        </Carousel>
    </div>
  );
}
