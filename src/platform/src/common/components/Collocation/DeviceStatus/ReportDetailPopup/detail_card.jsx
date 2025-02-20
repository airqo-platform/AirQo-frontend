import InfoIcon from '@/icons/Common/info_circle.svg';
import ResetThreshold from '../ResetThreshold';
import { useState } from 'react';

const STATUS_COLOR_CODES = {
  passed: 'bg-green-200',
  failed: 'bg-red-200',
  running: 'bg-turquoise-200',
  scheduled: 'bg-yellow-200',
};

const DetailCard = ({
  index,
  action,
  description,
  extra_message,
  status,
  batchId,
  type,
  handleReportClick,
  closeModal,
}) => {
  const [openThresholdResetForm, setOpenThresholdResetForm] = useState(false);

  return (
    <div
      key={index}
      className={`self-stretch p-4 ${
        STATUS_COLOR_CODES[status.toLowerCase()]
      } flex-col justify-start items-start gap-3 flex`}
    >
      <div className="flex-col justify-start items-start gap-1 flex">
        <div className="justify-start items-start gap-1.5 inline-flex">
          <div className="w-3.5 h-3.5 relative">
            <InfoIcon />
          </div>
          <div className="text-gray-700 text-sm font-semibold leading-none">
            {extra_message}
          </div>
        </div>
        <div className="text-gray-700 text-sm font-normal leading-snug">
          {description}
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-end items-start md:self-stretch md:justify-end md:items-center gap-4 md:inline-flex pt-4">
        <div className="justify-end items-center gap-4 flex">
          <div className="text-gray-700 text-sm leading-none">
            <button className="underline" onClick={handleReportClick}>
              Full Report
            </button>
          </div>
          <button
            className="text-gray-700 text-sm leading-none underline capitalize"
            onClick={() => setOpenThresholdResetForm(!openThresholdResetForm)}
          >
            {action.toLowerCase().includes('adjust') && action}
          </button>
        </div>
      </div>
      {openThresholdResetForm && (
        <ResetThreshold batchId={batchId} type={type} closeModal={closeModal} />
      )}
    </div>
  );
};

export default DetailCard;
