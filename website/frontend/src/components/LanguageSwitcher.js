import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setLanguageTab } from '../../reduxStore/EventsNav/NavigationSlice';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import DoneIcon from '@mui/icons-material/Done';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

const LanguageSwitcher = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const languageTab = useSelector((state) => state.eventsNavTab.languageTab);
  const [language, setLanguage] = useState(localStorage.getItem('language') || languageTab);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const lngs = {
    en: { nativeName: 'English' },
    fr: { nativeName: 'French' }
  };

  // Ensure language is a key in lngs
  if (!Object.keys(lngs).includes(language)) {
    setLanguage('en');
  }

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
    dispatch(setLanguageTab(lng));
    localStorage.setItem('language', lng);
    setOpen(false);
  };

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (open && ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', checkIfClickedOutside);
    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside);
    };
  }, [open]);

  useEffect(() => {
    const localLanguage = localStorage.getItem('language');
    if (localLanguage && Object.keys(lngs).includes(localLanguage)) {
      setLanguage(localLanguage);
      i18n.changeLanguage(localLanguage);
      dispatch(setLanguageTab(localLanguage));
    }
  }, []);

  return (
    <div className="lang-container">
      <div className="wrapper">
        <div className="language-dropdown">
          <LanguageOutlinedIcon
            sx={{ stroke: '#536a87', strokeWidth: '0.5', width: '16px', height: '16px' }}
          />
          <div className="dropdown" onClick={() => setOpen(!open)}>
            <p>{lngs[language]?.nativeName}</p>
            {open && (
              <ul className="dropdown-list" ref={ref}>
                {Object.keys(lngs).map((lng) => (
                  <li
                    key={lng}
                    onClick={() => changeLanguage(lng)}
                    className={language === lng ? 'selected' : ''}>
                    <LanguageOutlinedIcon
                      sx={{ stroke: '#536a87', strokeWidth: '0.5', width: '16px', height: '16px' }}
                    />
                    {lngs[lng].nativeName}
                    {language === lng && (
                      <DoneIcon sx={{ stroke: '#145FFF', width: '14px', height: '14px' }} />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="clean-air-link">
          <p className="desktop-view">
            {t('topBanners.languageSwitcher.cleanAirText')}
            <a href="/clean-air">
              <span>
                {t('topBanners.languageSwitcher.linkText')}
                <ArrowRightAltIcon
                  className="arrow-icon"
                  sx={{
                    stroke: '#145FFF',
                    width: '14px',
                    height: '14px',
                    position: 'relative',
                    top: '2px',
                    left: '2px'
                  }}
                />
              </span>
            </a>
          </p>
          <p className="mobile-view">
            <a href="/clean-air">
              <span>{t('topBanners.languageSwitcher.mobileViewLinkText')}</span>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
