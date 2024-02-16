import React, { useEffect, useState, useRef } from 'react';
import SEO from 'utilities/seo';
import { useInitScrollTop } from 'utilities/customHooks';
import { isEmpty } from 'underscore';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveResource } from 'reduxStore/CleanAirNetwork/CleanAir';
import { ReportComponent } from 'components/CleanAir';
import { getAllCleanAirApi } from 'apis/index.js';
import Loadspinner from 'src/components/LoadSpinner/SectionLoader';
import { useTranslation } from 'react-i18next';
import { RegisterSection, IntroSection } from 'components/CleanAir';
import ResourceImage from 'assets/img/cleanAir/resource.png';
import DoneIcon from '@mui/icons-material/Done';
import Slide from '@mui/material/Slide';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const CleanAirPublications = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  const filterRef = useRef(null);
  const dispatch = useDispatch();
  const [openfilter, setFilter] = useState(false);
  const [cleanAirResources, setCleanAirResources] = useState([]);
  const activeResource = useSelector((state) => state.cleanAirData.activeResource);
  const resources = [
    t('cleanAirSite.publications.navs.toolkits'),
    t('cleanAirSite.publications.navs.reports'),
    t('cleanAirSite.publications.navs.workshops'),
    t('cleanAirSite.publications.navs.research')
  ];
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEmpty(activeResource)) {
      dispatch(setActiveResource(t('cleanAirSite.publications.navs.toolkits')));
    }
  }, [activeResource]);

  useEffect(() => {
    setLoading(true);
    getAllCleanAirApi()
      .then((response) => {
        setCleanAirResources(response);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  const toolkitData = cleanAirResources.filter(
    (resource) => resource.resource_category === 'toolkit'
  );
  const technicalReportData = cleanAirResources.filter(
    (resource) => resource.resource_category === 'technical_report'
  );
  const workshopReportData = cleanAirResources.filter(
    (resource) => resource.resource_category === 'workshop_report'
  );
  const researchPublicationData = cleanAirResources.filter(
    (resource) => resource.resource_category === 'research_publication'
  );

  const ITEMS_PER_PAGE = 3;

  const renderData = (data, showSecondAuthor) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

    const handleClickNext = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    };

    const handleClickPrev = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };

    const currentItems = data.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

    if (currentItems.length === 0 || !currentItems) {
      return (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            color: '#808080',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '60px'
          }}>
          <h1>{t('cleanAirSite.publications.noResources')}</h1>
        </div>
      );
    }

    return (
      <div>
        {currentItems.map((item, index) => (
          <ReportComponent
            key={index}
            title={item.resource_title}
            authors_title={item.author_title}
            authors={item.resource_authors}
            link={item.resource_link}
            resourceCategory={item.resource_category}
            linkTitle={item.link_title || t('cleanAirSite.publications.cardBtnText')}
            showSecondAuthor={showSecondAuthor}
            resourceFile={item.resource_file}
          />
        ))}
        {data.length > ITEMS_PER_PAGE && (
          <div className="pagination">
            <button onClick={handleClickPrev} disabled={currentPage === 1}>
              <KeyboardDoubleArrowLeftIcon sx={{ fill: currentPage === 1 ? '#D1D1D1' : '#000' }} />
            </button>
            <p>
              {currentPage} of {totalPages}
            </p>
            <button onClick={handleClickNext} disabled={currentPage === totalPages}>
              <KeyboardDoubleArrowRightIcon
                sx={{ fill: currentPage === totalPages ? '#D1D1D1' : '#000' }}
              />
            </button>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterRef]);

  const handleFilterSelect = (filter) => {
    dispatch(setActiveResource(filter));
    setFilter(false);
  };

  return (
    <div className="page-wrapper">
      <SEO
        title="Partners"
        siteTitle="CLEAN-Air Network"
        description="CLEAN-Air Africa Network is a network of African cities and partners committed to improving air quality and reducing carbon emissions through knowledge sharing and capacity building."
      />

      {/* section 1 */}
      <IntroSection image={ResourceImage} imagePosition={'48%'} />

      {/* section 2 */}
      {loading && (
        <div
          style={{
            position: 'relative',
            margin: '60px auto'
          }}>
          <Loadspinner />
        </div>
      )}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'auto',
          margin: '70px auto',
          backgroundColor: '#EDF3FF',
          display: loading ? 'none' : 'block'
        }}>
        <div className="events">
          <div className="events-header">
            <h1 className="events-title">{t('cleanAirSite.publications.title')}</h1>
            <div className="events-header-buttons">
              <div style={{ position: 'relative' }}>
                <button onClick={() => setFilter(!openfilter)}>
                  <span style={{ marginRight: '10px', textTransform: 'capitalize' }}>
                    {activeResource}
                  </span>{' '}
                  <KeyboardArrowDownIcon />
                </button>
                <Slide direction="down" in={openfilter}>
                  <ul
                    className="drop-down-list"
                    ref={filterRef}
                    style={{
                      width: '240px'
                    }}>
                    {resources.map((resource) => (
                      <li
                        key={resource}
                        style={{
                          textTransform: 'capitalize',
                          backgroundColor: resource === activeResource ? '#EBF5FF' : ''
                        }}
                        onClick={() => {
                          handleFilterSelect(resource);
                        }}>
                        {resource}
                        {resource === activeResource && (
                          <DoneIcon sx={{ stroke: '#145FFF', width: '16px', height: '16px' }} />
                        )}
                      </li>
                    ))}
                  </ul>
                </Slide>
              </div>
            </div>
          </div>
          <div className="resource-body">
            {activeResource === t('cleanAirSite.publications.navs.toolkits') && (
              <div className="reports">{renderData(toolkitData, false)}</div>
            )}
            {activeResource === t('cleanAirSite.publications.navs.reports') && (
              <div className="reports">{renderData(technicalReportData, true)}</div>
            )}
            {activeResource === t('cleanAirSite.publications.navs.workshops') && (
              <div className="reports">{renderData(workshopReportData, false)}</div>
            )}
            {activeResource === t('cleanAirSite.publications.navs.research') && (
              <div className="reports">{renderData(researchPublicationData, true)}</div>
            )}
          </div>
        </div>
      </div>

      {/* Register Membership */}
      <RegisterSection link="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform" />
    </div>
  );
};

export default CleanAirPublications;
