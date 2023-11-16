import React, { useEffect, useState, useRef } from 'react';
import SEO from 'utilities/seo';
import { useInitScrollTop } from 'utilities/customHooks';
import { isEmpty } from 'underscore';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveResource } from 'reduxStore/CleanAirNetwork/CleanAir';
import { CardComponent, ReportComponent } from 'components/CleanAir';
import { getAllCleanAirApi } from 'apis/index.js';
import ListIcon from '@mui/icons-material/List';
import CloseIcon from '@mui/icons-material/Close';
import useWindowSize from 'utilities/customHooks';

const ResourceMenuItem = ({ activeResource, resource, dispatch, setToggle }) => {
  const { width } = useWindowSize();
  const isActive = activeResource === resource;
  const className = isActive ? 'active' : 'resource-menu-item-link';
  const onClick = () => {
    dispatch(setActiveResource(resource));
    if (width < 1081) {
      setToggle();
    }
  };

  return (
    <li className={className} onClick={onClick}>
      {resource.charAt(0).toUpperCase() + resource.slice(1)}
    </li>
  );
};

const CleanAirPublications = () => {
  useInitScrollTop();
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const [toggle, setToggle] = useState(false);
  const [cleanAirResources, setCleanAirResources] = useState([]);
  const activeResource = useSelector((state) => state.cleanAirData.activeResource);
  const resources = ['toolkits', 'technical reports', 'workshop reports', 'research publications'];
  const { width } = useWindowSize();

  useEffect(() => {
    if (isEmpty(activeResource)) {
      dispatch(setActiveResource('toolkits'));
    }
  }, [activeResource]);

  useEffect(() => {
    getAllCleanAirApi()
      .then((response) => {
        setCleanAirResources(response);
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    const resourceMenuItem = document.querySelector('.menu-wrapper');
    if (width < 1081) {
      resourceMenuItem.style.display = 'none';
    } else {
      resourceMenuItem.style.display = 'block';
    }
  }, [width]);

  const handleToggle = () => {
    setToggle(!toggle);
    const resourceMenuItem = document.querySelector('.menu-wrapper');
    if (toggle) {
      resourceMenuItem.style.display = 'none';
    } else {
      resourceMenuItem.style.display = 'block';
    }
  };

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

  const ITEMS_PER_PAGE = 4;

  const renderData = (data, showSecondAuthor) => {
    const indexOfLastItem = activePage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

    if (currentItems.length === 0 && data.length === 0) {
      return (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '50px'
          }}>
          Loading...
        </div>
      );
    }

    if (currentItems.length === 0) {
      return (
        <div className="no-data">
          <h1>No Data</h1>
        </div>
      );
    }

    return currentItems.map((resource, index) => (
      <div key={index}>
        <ReportComponent
          title={resource.resource_title}
          authors={resource.resource_authors}
          link={resource.resource_link}
          linkTitle="Read Journal"
          showSecondAuthor={showSecondAuthor}
          resourceFile={resource.resource_file}
        />
      </div>
    ));
  };

  const [activePage, setActivePage] = useState(1);

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
  };

  useEffect(() => {
    setActivePage(1);
  }, [activeResource]);

  const renderPagination = () => {
    let data;
    switch (activeResource) {
      case 'toolkits':
        data = toolkitData;
        break;
      case 'technical reports':
        data = technicalReportData;
        break;
      case 'workshop reports':
        data = workshopReportData;
        break;
      case 'research publications':
        data = researchPublicationData;
        break;
      default:
        data = [];
    }

    if (data.length <= ITEMS_PER_PAGE) {
      return null;
    }

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(data.length / ITEMS_PER_PAGE); i++) {
      pageNumbers.push(i);
    }

    const handlePrevPage = () => {
      if (activePage > 1) {
        setActivePage(activePage - 1);
      }
      document.getElementById('top-menu-sec').scrollIntoView();
    };

    const handleNextPage = () => {
      if (activePage < pageNumbers.length) {
        setActivePage(activePage + 1);
      }
      document.getElementById('top-menu-sec').scrollIntoView();
    };

    return (
      <nav className="list-page events">
        <ul className="pagination">
          <li className="page-item">
            <a onClick={handlePrevPage} className="page-link">
              {'<'}
            </a>
          </li>
          {pageNumbers.map((number) => (
            <li key={number} className="page-item">
              <a onClick={() => handlePageChange(number)} className="page-link">
                {number}
              </a>
            </li>
          ))}
          <li className="page-item">
            <a onClick={handleNextPage} className="page-link">
              {'>'}
            </a>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="page-wrapper">
      <SEO
        title="CLEAN-Air Africa Network | Partners"
        siteTitle="CLEAN-Air Africa Network"
        description="CLEAN-Air Africa Network is a network of African cities and partners committed to improving air quality and reducing carbon emissions through knowledge sharing and capacity building."
      />

      <div>
        <div className="partners">
          <div className="partners-wrapper" style={{ marginTop: '50px' }}>
            <div className="resources-container">
              <div className="resource-menu" id="top-menu-sec">
                <div className="title-wrapper">
                  <h1 className="resource-menu-title">
                    RESOURCE
                    <br />
                    <span>CENTER</span>
                  </h1>

                  <div className="resource-menu-icon" onClick={handleToggle}>
                    {toggle ? <CloseIcon fontSize="large" /> : <ListIcon fontSize="large" />}
                  </div>
                </div>
                <div className="menu-wrapper" ref={menuRef}>
                  <ul className="resource-menu-item">
                    {resources.map((resource) => (
                      <ResourceMenuItem
                        key={resource}
                        activeResource={activeResource}
                        resource={resource}
                        dispatch={dispatch}
                        setToggle={handleToggle}
                      />
                    ))}
                  </ul>
                </div>
              </div>

              <div className="resource-body">
                {activeResource === 'toolkits' && renderData(toolkitData, false)}
                {activeResource === 'technical reports' && renderData(technicalReportData, true)}
                {activeResource === 'workshop reports' && renderData(workshopReportData, true)}
                {activeResource === 'research publications' && renderData(researchPublicationData)}
                {renderPagination(activeResource)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanAirPublications;
