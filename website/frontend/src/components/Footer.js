import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Modal, Box } from '@mui/material';
import MakText from 'icons/nav/MakText';
import AirQo from 'icons/footer/AirQo';
import Instagram from 'icons/footer/Instagram';
import Facebook from 'icons/footer/Facebook';
import Youtube from 'icons/footer/Youtube';
import Twitter from 'icons/footer/Twitter';
import Location from 'icons/footer/Location';
import ArrowDown from 'icons/footer/ArrowDown';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CancelIcon from 'icons/footer/cancel.svg';

import Uganda from 'icons/africanCities/countries/uganda.svg';
import Kenya from 'icons/africanCities/countries/kenya.svg';
import Nigeria from 'icons/africanCities/countries/nigeria.svg';
import Ghana from 'icons/africanCities/countries/ghana.svg';
import Burundi from 'icons/africanCities/countries/burundi.svg';
import Senegal from 'icons/africanCities/countries/senegal.svg';
import Mozambique from 'icons/africanCities/countries/mozambique.svg';

import { useAirqloudSummaryData, useCurrentAirqloudData } from 'reduxStore/AirQlouds/selectors';
import { setCurrentAirQloudData } from 'reduxStore/AirQlouds/operations';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: 600,
  // minHeight: 200,
  width: '90%',
  bgcolor: 'background.paper',
  // border: '2px solid #000',
  // boxShadow: 24,
  // p: 4,
};

const flagMapper = {
  uganda: <Uganda />,
  kenya: <Kenya />,
  nigeria: <Nigeria />,
  ghana: <Ghana />,
  burundi: <Burundi />,
  senegal: <Senegal />,
  mozambique: <Mozambique />,
};

const CountryTab = ({
  className, flag, name, onClick,
}) => (
        <div className={className} onClick={onClick}>{flag} <span>{name}</span></div>
);

const Footer = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');

  const airqloudSummaries = useAirqloudSummaryData();
  const currentAirqloud = useCurrentAirqloudData();

  const currentAirqloudData = airqloudSummaries[currentAirqloud] || { numberOfSites: 0 };

  const explodeSummaryCount = (numberOfSites) => {
    const paddedCount = numberOfSites.toString().padStart(4, '0');
    return paddedCount.split('');
  };

  const toggleOpen = () => setOpen(!open);

  const active = (country) => (country === selectedCountry ? 'tab-selected' : '');

  const onTabClick = (country) => () => setSelectedCountry(country);

  const onCancel = () => {
    setSelectedCountry(currentAirqloud);
    setOpen(false);
  };

  const onSave = () => {
    dispatch(setCurrentAirQloudData(selectedCountry));
    setOpen(false);
  };

  useEffect(() => {
    setSelectedCountry(currentAirqloud);
  }, [currentAirqloud]);
  return (
        <footer className="footer-wrapper">
            <div className="Footer">
            <div className="body-section">
                <div className="logo">
                    <AirQo />
                    <div className="logo-text">Clean air for all <br/> African Cities!</div>
                    <div className="social-links">
                        <a target="_blank" href="https://www.linkedin.com/company/airqo/mycompany/"><LinkedInIcon style={{color:"#145DFF", height: "32px", width: "32px"}} /></a>
                        <a target="_blank" href="https://www.facebook.com/AirQo"><Facebook /></a>
                        <a target="_blank" href="https://www.youtube.com/channel/UCx7YtV55TcqKGeKsDdT5_XQ"><Youtube /></a>
                        <a target="_blank" href="https://twitter.com/AirQoProject"><Twitter /></a>
                    </div>
                </div>
                <div className="content">
                    <span className="content-tabs middle-tab">
                        <span>Solutions</span>
                        <div>
                            <span><Link to="/solutions/african-cities/uganda">For African cities</Link></span>
                            <span><Link to="/solutions/communities">For Communities</Link></span>
                            <span><Link to="/solutions/research">For Research</Link></span>
                        </div>
                    </span>
                        {/* <span className="content-tabs middle-tab"> */}
                        {/*    <span>Our Works</span> */}
                        {/*    <div> */}
                        {/*        <span>Air Quality Monitors</span> */}
                        {/*        <span>Air Quality Analytics</span> */}
                        {/*        <span>Air Quality Mobile App</span> */}
                        {/*    </div> */}
                        {/* </span> */}
                        <span className="content-tabs">
                        <span>About</span>
                        <div>
                            <span><Link to="/about-us">About</Link></span>
                            <span><Link to="/contact">Contact</Link></span>
                            <span><Link to="/press">Press</Link></span>
                            <span><a target="_blank" href="https://medium.com/@airqo">Blog</a></span>
                        </div>
                        </span>
                    </div>
                    <div className="airqlouds-summary" onClick={toggleOpen}>
                        <div className="airqloud-dropdown">
                            <Location />
                            <span>{currentAirqloud}</span>
                            <ArrowDown />
                        </div>
                        <div className="airqloud-count">
                        <span className="count-value">
                            {
                                explodeSummaryCount(currentAirqloudData.numberOfSites)
                                  .map((value, key) => <span key={key}>{value}</span>)
                            }
                        </span> {' '}
                            <span className="count-text">Monitors in {currentAirqloud}</span>
                        </div>
                    </div>
                </div>
                <div className="copyright-section">
                    <div className="copyright-container">
                        <div className="text-copyright">© {new Date().getFullYear()} AirQo</div>
                        <div className="terms-section">
                            <span className="text-terms mr-24"><Link to="/terms">Terms of service</Link></span>
                            {/* <span className="text-terms mr-24">Privacy policy</span> */}
                            {/* <span className="text-terms mr-24">Sustainability</span> */}
                        </div>
                    </div>
                    <div className="project-container mb-24">
                        <div className="project">
                            <div className="project-text">A project by</div>
                            <MakText />
                        </div>
                    </div>
                </div>
            </div>
            <Modal open={open} onClose={toggleOpen}>
                <Box sx={style}>
                    <div className="modal">
                        <div className="modal-title">
                            <span>Country AirQloud</span>
                            <CancelIcon className="modal-cancel" onClick={toggleOpen} />
                        </div>
                        <div className="divider" />
                        <div className="title">Our growing network in Africa</div>
                        <div className="sub-title">View AirQo developments in your country</div>
                        <div className="category-label">Selected country</div>
                        <CountryTab
                          className="tab tab-selected tab-margin"
                          flag={flagMapper[currentAirqloud.toLowerCase()]}
                          name={currentAirqloud}
                        />
                        <div className="category-label">Select country</div>
                        <div className="countries">
                            <CountryTab
                              className={`tab tab-margin-sm ${active('Uganda')}`}
                              flag={<Uganda />}
                              name="Uganda"
                              onClick={onTabClick('Uganda')}
                            />
                            <CountryTab
                              className={`tab tab-margin-sm ${active('Kenya')}`}
                              flag={<Kenya />}
                              name="Kenya"
                              onClick={onTabClick('Kenya')}
                            />
                            <CountryTab
                              className={`tab tab-margin-sm ${active('Nigeria')}`}
                              flag={<Nigeria />}
                              name="Nigeria"
                              onClick={onTabClick('Nigeria')}
                            />
                            <CountryTab
                              className={`tab tab-margin-sm ${active('Ghana')}`}
                              flag={<Ghana />}
                              name="Ghana"
                              onClick={onTabClick('Ghana')}
                            />
                            <CountryTab
                              className={`tab tab-margin-sm ${active('Burundi')}`}
                              flag={<Burundi />}
                              name="Burundi"
                              onClick={onTabClick('Burundi')}
                            />
                            <CountryTab
                              className={`tab tab-margin-sm ${active('Senegal')}`}
                              flag={<Senegal />}
                              name="Senegal"
                              onClick={onTabClick('Senegal')}
                            />
                            <CountryTab
                              className={`tab tab-margin-sm ${active('Mozambique')}`}
                              flag={<Mozambique />}
                              name="Mozambique"
                              onClick={onTabClick('Mozambique')}
                            />
                        </div>
                        <div className="divider" />
                        <div className="btns">
                            <div className="cancel-btn" onClick={onCancel}>cancel</div>
                            <div className="save-btn" onClick={onSave}>save</div>
                        </div>
                    </div>
                </Box>
            </Modal>
        </footer>
  );
};

export default Footer;
