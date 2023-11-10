import React, { useEffect, useState } from 'react';
import Tabs from '@/components/Tabs';
import Tab from '@/components/Tabs/Tab';
import withAuth from '@/core/utils/protectedRoute';
import Layout from '@/components/Layout';
import OverView from './tabs/OverView';
import Explore from './tabs/Explore';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import Button from '@/components/Button';
import SettingsIcon from '@/icons/settings.svg';
import DownloadIcon from '@/icons/Common/download.svg';
import { useWindowSize } from '@/lib/windowSize';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserDefaults } from '@/lib/store/services/charts/userDefaultsSlice';
import ExportDataModal from '@/components/Modal/ExportDataModal';
import AlertBox from '@/components/AlertBox';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AuthenticatedHomePage = () => {
  const dispatch = useDispatch();
  const isMobile = useWindowSize().width < 500;
  const userDefaults = useSelector((state) => state.userDefaults.defaults);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [data, setData] = useState({});
  const [alert, setAlert] = useState({
    type: '',
    message: '',
    show: false,
  });

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem('loggedUser'))._id;
    if (userId) {
      dispatch(fetchUserDefaults(userId));
    }
  }, []);

  const exportFile = () => {
    // if (userDefaults && userDefaults?.sites.length !== 0) {
    // let exportData = {
    //   startDateTime: userDefaults.startDate,
    //   endDateTime: userDefaults.endDate,
    //   sites: userDefaults.sites,
    // };
    // setData(exportData);
    setOpenConfirmModal(true);
    // } else {
    //   setAlert({
    //     type: 'error',
    //     message: 'No sites selected',
    //     show: true,
    //   });
    // }
  };

  const printFile = () => {
    const chartContainer = document.getElementById('explore-chart-container');

    if (chartContainer) {
      const rect = chartContainer.getBoundingClientRect();
      const extraSpace = 20;
      const width = rect.width + extraSpace;
      const height = rect.height + extraSpace;

      html2canvas(chartContainer, {
        scale: 3,
        useCORS: true,
        backgroundColor: rect.backgroundColor,
        width: width,
        height: height,
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `chart.pdf`;

        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [width, height],
        });
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, width, height);
        pdf.save('chart.pdf');
      });
    }
  };

  const renderChildrenRight = () => {
    return [
      {
        label: 'Overview',
        children: (
          <div className='flex space-x-3 mb-2'>
            <CustomCalendar
              initialStartDate={new Date()}
              initialEndDate={new Date()}
              id='datePicker1'
              position='down'
              className='left-[60px] md:right-0 lg:right-0'
              dropdown
            />
            <Button variant='outlined' className='text-sm font-medium' Icon={SettingsIcon}>
              Customize
            </Button>
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
              onClick={printFile}
            >
              Print
            </Button>
            <Button
              className='text-sm font-medium capitalize'
              variant='filled'
              Icon={DownloadIcon}
              onClick={exportFile}
            >
              Export
            </Button>
          </div>
        ),
      },
    ];
  };
  return (
    <Layout topbarTitle={'Analytics'} noBorderBottom>
      <AlertBox
        type={alert.type}
        message={alert.message}
        show={alert.show}
        hide={() => setAlert({ ...alert, show: false })}
      />
      <div className='pt-2'>
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
            <Explore />
          </Tab>
        </Tabs>
      </div>
      {open && (
        <ExportDataModal
          open={openConfirmModal}
          onClose={() => setOpenConfirmModal(false)}
          handleExportPDF={printFile}
        />
      )}
    </Layout>
  );
};

export default withAuth(AuthenticatedHomePage);
