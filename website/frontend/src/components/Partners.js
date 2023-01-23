import React from 'react';
import GoogleLogo from 'icons/homepage/partners/google.svg';
import WeHubitLogo from 'assets/img/partners/WeHubit.png';
import USEmbassyLogo from 'assets/img/partners/USEmbassy.png';
import UNEPLogo from 'icons/homepage/partners/UN.svg';

const Partners = () => {
  return (
      <div className="partners-section">
          <div className="backdrop">
              <div className="content">
                  <div>
                      <span className="title"> Airqo is supported by</span>
                  </div>
                  <div className="logos">
                      <div>
                          <GoogleLogo />{' '}
                      </div>
                      <div>
                          <img src={WeHubitLogo} alt="" />
                      </div>
                      <div>
                          <img src={USEmbassyLogo} alt="" />
                      </div>
                      <div>
                          <UNEPLogo />{' '}
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
}

export default Partners;