import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { showGetInvolvedModal } from 'reduxStore/GetInvolved/operations';
import AirQo from 'icons/nav/AirQo';
import MenuIcon from 'assets/svg/Menu.svg';
import CloseIcon from 'assets/svg/Close.svg';
import { Link } from 'react-router-dom';
import NavTab from './NavTab';
import { useTranslation } from 'react-i18next';
import PublicIcon from '@mui/icons-material/Public';

const TopBar = () => {
  const dispatch = useDispatch();
  const showModal = () => dispatch(showGetInvolvedModal(true));

  const toggleMenu = () => {
    setOpenItem(null);
    document.getElementById('menu').classList.toggle('toggle_menu_btn');
    document.getElementById('close-menu').classList.toggle('toggle_close_menu_btn');
    document.getElementById('nav-center').classList.toggle('toggle_nav_center');
    // document.getElementById('nav-right').classList.toggle('toggle_nav_right');
  };

  const toggleCloseMenu = () => {
    setOpenItem(null);
    document.getElementById('close-menu').classList.remove('toggle_close_menu_btn');
    document.getElementById('menu').classList.remove('toggle_menu_btn');
    document.getElementById('nav-center').classList.remove('toggle_nav_center');
    // document.getElementById('nav-right').classList.remove('toggle_nav_right');
  };

  // tracking the current open item
  const [openItem, setOpenItem] = useState(null);

  // for handling window resize
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handling click event
  const handleClick = (item) => {
    console.log(item);
    if (width < 1024) {
      setOpenItem(openItem === item ? null : item);
    } else {
      return;
    }
  };
  // Translation hook
  const { t } = useTranslation();

  return (
    <div className="TopBar">
      <div className="wrapper">
        <div className="logo">
          <Link to="/">
            <AirQo />
          </Link>
        </div>
        <div className="nav-center" id="nav-center">
          <div className="nav-wrapper">
            <div className="nav-dropdown-item">
              <NavTab text={t('navbar.products.title')} onClick={() => handleClick('Products')} />
              <div className="dropdown" id={openItem === 'Products' ? 'solutions-dropdown' : ''}>
                <h3 className="title">{t('navbar.products.title')}</h3>
                <div className="dropdown-list">
                  <div className="dropdown-list-item">
                    <Link to="/products/monitor" style={{ textDecoration: 'none' }}>
                      <h3>{t('navbar.products.subnav.monitor.name')}</h3>
                      <h4>{t('navbar.products.subnav.monitor.desc')}</h4>
                    </Link>
                  </div>
                  <div className="dropdown-list-item">
                    <Link to="/products/analytics" style={{ textDecoration: 'none' }}>
                      <h3>{t('navbar.products.subnav.dashboard.name')}</h3>
                      <h4>{t('navbar.products.subnav.dashboard.desc')}</h4>
                    </Link>
                  </div>
                  <div className="dropdown-list-item">
                    <Link to="/products/mobile-app" style={{ textDecoration: 'none' }}>
                      <h3>{t('navbar.products.subnav.mobileapp.name')}</h3>
                      <h4>{t('navbar.products.subnav.mobileapp.desc')}</h4>
                    </Link>
                  </div>
                  <div className="dropdown-list-item">
                    <Link to="/products/api" style={{ textDecoration: 'none' }}>
                      <h3>{t('navbar.products.subnav.api.name')}</h3>
                      <h4>{t('navbar.products.subnav.api.desc')}</h4>
                    </Link>
                  </div>
                  <div className="dropdown-list-item">
                    <Link to="/products/calibrate" style={{ textDecoration: 'none' }}>
                      <h3>{t('navbar.products.subnav.calibrate.name')}</h3>
                      <h4>{t('navbar.products.subnav.calibrate.desc')}</h4>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="nav-dropdown-item">
            <NavTab text={t('navbar.solutions.title')} onClick={() => handleClick('Solutions')} />
            <div className="dropdown" id={openItem === 'Solutions' ? 'solutions-dropdown' : ''}>
              <h3 className="title">{t('navbar.solutions.title')}</h3>
              <div className="dropdown-list">
                <div className="dropdown-list-item">
                  <Link to="/solutions/african-cities" style={{ textDecoration: 'none' }}>
                    <h3>{t('navbar.solutions.subnav.cities.name')}</h3>
                    <h4>{t('navbar.solutions.subnav.cities.desc')}</h4>
                  </Link>
                </div>
                <div className="dropdown-list-item">
                  <Link to="/solutions/communities" style={{ textDecoration: 'none' }}>
                    <h3>{t('navbar.solutions.subnav.communities.name')}</h3>
                    <h4>{t('navbar.solutions.subnav.communities.desc')}</h4>
                  </Link>
                </div>
                <div className="dropdown-list-item">
                  <Link to="/solutions/research" style={{ textDecoration: 'none' }}>
                    <h3>{t('navbar.solutions.subnav.research.name')}</h3>
                    <h4>{t('navbar.solutions.subnav.research.desc')}</h4>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="nav-dropdown-item single-links">
            <NavTab text={t('navbar.about.title')} onClick={() => handleClick('About')} />
            <div className="dropdown" id={openItem === 'About' ? 'solutions-dropdown' : ''}>
              <h3 className="title">{t('navbar.about.title')} AirQo</h3>
              <div className="dropdown-list">
                <div className="dropdown-list-item">
                  <Link to="/about-us">
                    <h3>{t('navbar.about.subnav.aboutUs')}</h3>
                  </Link>
                </div>
                <div className="dropdown-list-item">
                  <Link to="/events">
                    <h3>{t('navbar.about.subnav.events')}</h3>
                  </Link>
                </div>
                <div className="dropdown-list-item">
                  <Link to="/resources">
                    <h3>{t('navbar.about.subnav.resources')}</h3>
                  </Link>
                </div>
                <div className="dropdown-list-item">
                  <Link to="/press">
                    <h3>{t('navbar.about.subnav.press')}</h3>
                  </Link>
                </div>
                <div className="dropdown-list-item">
                  <Link to="/careers">
                    <h3>{t('navbar.about.subnav.careers')}</h3>
                  </Link>
                </div>
                <div className="dropdown-list-item" onClick={showModal}>
                  <h3>{t('navbar.getInvolved')}</h3>
                </div>
                <div className="dropdown-list-item">
                  <Link to="/contact">
                    <h3>{t('navbar.about.subnav.contact')}</h3>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* <NavTab text="About" path="/about-us" hideArrow /> */}
          {/* <NavTab text={t('navbar.getInvolved')} hideArrow colored onClick={showModal} /> */}
          <Link to="/clean-air" className="clean-air-tab">
            <div>
              <PublicIcon />
              <h3>{t('navbar.about.subnav.cleanAir')}</h3>
            </div>
          </Link>
          <NavTab text={t('navbar.exploreData')} path="/explore-data" hideArrow filled />
        </div>
      </div>
      <MenuIcon className="menu-btn" id="menu" onClick={toggleMenu} />
      <CloseIcon className="close-menu-btn" id="close-menu" onClick={toggleCloseMenu} />
    </div>
  );
};

export default TopBar;
