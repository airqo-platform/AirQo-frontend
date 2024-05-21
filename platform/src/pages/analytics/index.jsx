import React, { useEffect, useState, useRef, useCallback } from 'react';
import Tabs from '@/components/Tabs';
import Tab from '@/components/Tabs/Tab';
import withAuth from '@/core/utils/protectedRoute';
import Layout from '@/components/Layout';
import OverView from './tabs/OverView';
import Explore from './tabs/Explore';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import Button from '@/components/Button';
import SettingsIcon from '@/icons/settings.svg';
import CustomiseLocationsComponent from '@/components/Customise';
import DownloadIcon from '@/icons/Common/download.svg';
import { useWindowSize } from '@/lib/windowSize';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserPreferences } from '@/lib/store/services/charts/userDefaultsSlice';
import ExportDataModal from '@/components/Modal/ExportDataModal';
import AlertBox from '@/components/AlertBox';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PrintReportModal from '@/components/Modal/PrintReportModal';
import TabButtons from '@/components/Button/TabButtons';
import useOutsideClick from '@/core/utils/useOutsideClick';

const AuthenticatedHomePage = () => {
  const dispatch = useDispatch();
  const isMobile = useWindowSize().width < 500;
  const chartDataRange = useSelector((state) => state.chart.chartDataRange);
  const chartSites = useSelector((state) => state.chart.chartSites);

  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openPrintModal, setOpenPrintModal] = useState(false);
  const [data, setData] = useState({});
  const [alert, setAlert] = useState({ type: '', message: '', show: false });
  const [customise, setCustomise] = useState(false);

  const customiseRef = useRef();

  useOutsideClick(customiseRef, () => {
    if (customise) setCustomise(false);
  });

  const toggleCustomise = () => setCustomise(!customise);

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem('loggedUser'))._id;
    if (userId) {
      dispatch(fetchUserPreferences(userId));
    }
  }, [dispatch]);

  /**
   * Handle export button click
   * @returns {void}
   * */
  const handleExport = useCallback(() => {
    if (
      chartSites &&
      chartDataRange &&
      chartDataRange.startDate &&
      chartDataRange.endDate &&
      chartSites.length > 0
    ) {
      setData({
        startDate: chartDataRange.startDate,
        endDate: chartDataRange.endDate,
        sites: chartSites,
      });
      setOpenConfirmModal(true);
    } else {
      setAlert({ type: 'error', message: 'Please select sites and date range', show: true });
    }
  }, [chartSites, chartDataRange]);

  /**
   * Handle print button click
   * @returns {void}
   * */
  const handlePrint = useCallback(() => {
    if (
      chartDataRange &&
      chartDataRange.startDate &&
      chartDataRange.endDate &&
      chartSites.length > 0
    ) {
      setData({
        sites: chartSites,
        startDate: chartDataRange.startDate,
        endDate: chartDataRange.endDate,
      });
      setOpenPrintModal(true);
    } else {
      setAlert({ type: 'error', message: 'Please select sites and date range', show: true });
    }
  }, [chartSites, chartDataRange]);

  /**
   * Print the chart as a PDF
   * @returns {void}
   * */
  const printFile = useCallback(() => {
    const chartContainer = document.getElementById('explore-chart-container');

    if (chartContainer) {
      const rect = chartContainer.getBoundingClientRect();
      const extraSpace = 20;
      const width = rect.width + extraSpace;
      const height = rect.height + extraSpace;

      html2canvas(chartContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: rect.backgroundColor,
        width: width,
        height: height,
      }).then((canvas) => {
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [width, height],
        });
        pdf.addImage(canvas.toDataURL('image/png', 0.8), 'PNG', 0, 0, width, height);
        pdf.save('chart.pdf');
      });
    }
  }, []);

  /**
   * Render children for the right side of the topbar
   * @returns {Array}
   */
  const renderChildrenRight = () => {
    return [
      {
        label: 'Overview',
        children: (
          <div className='flex space-x-3 mb-3'>
            <CustomCalendar
              initialStartDate={new Date()}
              initialEndDate={new Date()}
              className='max-md:-right-12 md:right-2 lg:right-7 top-12'
              dropdown
            />
            <TabButtons Icon={SettingsIcon} btnText='Customize' onClick={() => toggleCustomise()} />
          </div>
        ),
      },
      {
        label: 'Explore',
        children: (
          <div className='flex space-x-3 mb-3'>
            <Button
              className='text-sm font-medium capitalize'
              variant='outlined'
              onClick={handlePrint}>
              Print
            </Button>
            <Button
              className='text-sm font-medium capitalize'
              variant='filled'
              Icon={DownloadIcon}
              onClick={handleExport}>
              Export
            </Button>
          </div>
        ),
      },
    ];
  };

  return (
    <Layout topbarTitle={'Analytics'} noBorderBottom pageTitle={'Analytics'}>
      <AlertBox
        type={alert.type}
        message={alert.message}
        show={alert.show}
        hide={() => setAlert({ ...alert, show: false })}
      />
      <div className='pt-2 transition-all duration-300 ease-in-out'>
        <Tabs childrenRight={!isMobile && renderChildrenRight()}>
          <Tab label='Overview'>
            {isMobile && (
              <div className='flex justify-end px-3 lg:px-16'>
                {renderChildrenRight()[0].children}
              </div>
            )}
            <OverView />
          </Tab>
          <Tab label='Explore'>
            {isMobile && (
              <div className='flex justify-end px-3 lg:px-16'>
                {renderChildrenRight()[1].children}
              </div>
            )}
            <Explore toggleCustomize={toggleCustomise} />
          </Tab>
        </Tabs>
        {customise && (
          <div ref={customiseRef}>
            <CustomiseLocationsComponent toggleCustomise={toggleCustomise} />
          </div>
        )}
      </div>
      {openConfirmModal && (
        <ExportDataModal
          open={openConfirmModal}
          onClose={() => setOpenConfirmModal(false)}
          handleExportPDF={printFile}
          data={data}
        />
      )}

      {openPrintModal && (
        <PrintReportModal
          title='Share report'
          open={openPrintModal}
          handlePrintPDF={printFile}
          onClose={() => setOpenPrintModal(false)}
          data={data}
          shareModel={false}
          format={'pdf'}
        />
      )}
    </Layout>
  );
};

export default withAuth(AuthenticatedHomePage);
