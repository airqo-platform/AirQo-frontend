import React, { useEffect, useState } from 'react';
import SEO from 'utilities/seo';
import { useInitScrollTop, useClickOutside } from 'utilities/customHooks';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveResource } from 'reduxStore/CleanAirNetwork/CleanAir';
import { ReportComponent } from 'components/CleanAir';
import { useTranslation } from 'react-i18next';
import { RegisterSection, IntroSection, RotatingLoopIcon } from 'components/CleanAir';
import ResourceImage from 'assets/img/cleanAir/resource.webp';
import DoneIcon from '@mui/icons-material/Done';
import Slide from '@mui/material/Slide';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CleanAirPageContainer from './Page';
import { fetchCleanAirData } from 'reduxStore/CleanAirNetwork/CleanAir';
import { isEmpty } from 'underscore';

const ITEMS_PER_PAGE = 3;

const CleanAirPublications = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  const filterRef = useClickOutside(() => setFilter(false));
  const dispatch = useDispatch();
  const [openfilter, setFilter] = useState(false);
  const cleanAirResources = useSelector((state) => state.cleanAirData.airData);
  const loading = useSelector((state) => state.cleanAirData.loading);
  const activeResource = useSelector((state) => state.cleanAirData.activeResource);
  const language = useSelector((state) => state.eventsNavTab.languageTab);
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * @description fetch clean air resources
   * @type {Array} cleanAirResources
   */
  useEffect(() => {
    if (isEmpty(cleanAirResources)) {
      dispatch(fetchCleanAirData(language));
    }
  }, [dispatch, language]);

  /**
   * @description set the active resource in the redux store
   */
  useEffect(() => {
    dispatch(setActiveResource(t('cleanAirSite.events.dropdowns.filter.options1.1')));
  }, [dispatch, language]);

  /**
   * @description Dropdown list of resources
   * @type {Array}
   */
  const resources = [
    t('cleanAirSite.events.dropdowns.filter.options1.1'),
    t('cleanAirSite.publications.navs.toolkits'),
    t('cleanAirSite.publications.navs.reports'),
    t('cleanAirSite.publications.navs.workshops'),
    t('cleanAirSite.publications.navs.research')
  ];

  /**
   * @description filter resources based on the resource category
   * @type {Array} toolkitData
   * @type {Array} technicalReportData
   * @type {Array} workshopReportData
   * @type {Array} researchPublicationData
   */
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

  const handleFilterSelect = (filter) => {
    dispatch(setActiveResource(filter));
    setFilter(false);
  };

  /**
   * @description render the resource data cards
   * @param {Array} data
   * @param {Boolean} showSecondAuthor
   * @returns {JSX.Element}
   */
  const renderData = (data, showSecondAuthor) => {
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
            resourceCategory={item.resource_category.replace(/_/g, ' ')}
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

  return (
    <CleanAirPageContainer>
      <div className="page-wrapper">
        {/* SEO */}
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
              padding: '50px 0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            <RotatingLoopIcon />
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
              {activeResource === t('cleanAirSite.events.dropdowns.filter.options1.1') && (
                <div className="reports">{renderData(cleanAirResources, false)}</div>
              )}
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
    </CleanAirPageContainer>
  );
};

export default CleanAirPublications;
