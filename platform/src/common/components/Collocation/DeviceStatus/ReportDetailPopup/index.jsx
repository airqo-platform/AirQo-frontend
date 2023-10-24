import { isEmpty } from 'underscore';
import DetailCard from './detail_card';
import { useRouter } from 'next/router';
import Button from '@/components/Button';
import { useEffect, useState } from 'react';
import { useGetCollocationBatchResultsQuery } from '@/lib/store/services/collocation';
import { saveAs } from 'file-saver';
import ReactPDF, {
  PDFViewer,
  Document,
  Page,
  Text,
  View,
  PDFDownloadLink,
  pdf,
} from '@react-pdf/renderer';
import ExportStatusReport from '../../BatchReport';
import dynamic from 'next/dynamic';

const DynamicPDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((module) => module.PDFDownloadLink),
  { ssr: false },
);

const ReportDetailCard = ({ deviceName, batchId, data, open, closeModal }) => {
  const router = useRouter();
  const [skip, setSkip] = useState(true);
  const [collocationBatchId, setCollocationBatchId] = useState('');
  const [exportData, setExportData] = useState([]);

  const {
    isLoading,
    isError,
    isSuccess,
    data: collocationBatchResults,
  } = useGetCollocationBatchResultsQuery(collocationBatchId, { skip: skip });
  const collocationBatchResultsData = collocationBatchResults ? collocationBatchResults.data : null;
  const [fileBlob, setFileBlob] = useState(null);

  const downloadBatchReport = (batchId) => () => {
    if (batchId !== '') {
      setCollocationBatchId(batchId);
      setSkip(false);
    }
  };

  //   useEffect(() => {
  //   if (collocationBatchResultsData && isSuccess) {
  //     console.log(fileBlob);
  //     if(fileBlob) {

  //     saveAs(fileBlob, 'collocation_report.pdf');
  //     };

  //     setSkip(true);
  //     setCollocationBatchId('');
  //   }
  // }, [collocationBatchResultsData, isSuccess]);

  return (
    <dialog id='report_detail_popup' className={`modal ${open && 'modal-open'} w-screen h-screen`}>
      <form
        method='dialog'
        className='modal-box p-0 overflow-hidden rounded max-w-3xl w-full h-full shadow border border-slate-100'
      >
        <div className='flex justify-between items-center p-5 border-b border-b-gray-200'>
          <div className='text-black text-base font-medium'>Status summary</div>
          <span className='flex items-center gap-3'>
            {/* <DynamicPDFDownloadLink document={<ExportStatusReport batchData={[]} />} fileName="collocation_report.pdf">
        {({ blob, url, loading, error }) => {
          setFileBlob(blob);
          return loading ? 'Loading document...' : 'Download now!'
        }}
      </DynamicPDFDownloadLink> */}
            {/* <Button
              className={`bg-blue-900 text-white text-sm ${isEmpty(data) && 'opacity-50'}}`}
              onClick={downloadBatchReport(batchId)}
              disabled={isEmpty(data)}
            >
              Download batch report
            </Button> */}
            <button onClick={closeModal} className='btn btn-sm btn-circle btn-ghost'>
              ✕
            </button>
          </span>
        </div>
        <div className='self-stretch px-5 pt-4 sm:pb-20 pb-10 flex-col items-start gap-3.5 flex h-full overflow-y-auto'>
          {!isEmpty(data) ? (
            data.map((item, index) => (
              <DetailCard
                index={index}
                action={item.action}
                description={item.description}
                extra_message={item.extra_message}
                status={item.status}
                title={item.title}
                batchId={batchId}
                type={item.type}
                handleReportClick={() => {
                  router.push({
                    pathname: `/collocation/reports/${deviceName}`,
                    query: {
                      device: deviceName,
                      batchId: batchId,
                    },
                  });
                }}
                closeModal={closeModal}
              />
            ))
          ) : (
            <div className='text-gray-400 text-sm font-normal leading-snug flex items-center justify-center mx-auto w-full h-full'>
              No report yet. Please check later
            </div>
          )}
        </div>
      </form>
    </dialog>
  );
};

export default ReportDetailCard;
