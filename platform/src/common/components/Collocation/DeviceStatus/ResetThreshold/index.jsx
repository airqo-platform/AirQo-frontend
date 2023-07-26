import Button from '@/components/Button';
import { useState } from 'react';
import { resetCollocationBatch } from '@/core/apis/Collocation';
import Toast from '@/components/Toast';

const ResetThreshold = ({ batchId, type, closeModal }) => {
  const [thresholdValue, setThresholdValue] = useState('');
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showRecomputeToast, setShowRecomputeToast] = useState(false);

  const submitForm = (e) => {
    e.preventDefault();

    let body = {};

    switch (type) {
      case 'INTRA_SENSOR_CORRELATION':
        body = {
          intraCorrelationThreshold: parseFloat(thresholdValue),
        };
        break;
      case 'INTER_SENSOR_CORRELATION':
        body = {
          interCorrelationThreshold: parseFloat(thresholdValue),
        };
        break;
      case 'DIFFERENCES':
        body = {
          differencesThreshold: parseFloat(thresholdValue),
        };
        break;
      case 'DATA_COMPLETENESS':
        body = {
          dataCompletenessThreshold: parseFloat(thresholdValue),
        };
        break;
      default:
        break;
    }

    resetCollocationBatch(body, { batchId })
      .then((res) => {
        setShowRecomputeToast(!showRecomputeToast);
        setTimeout(() => {
          setShowErrorToast(false);
          setErrorMessage('');
          setShowRecomputeToast(false);
          closeModal();
          window.location.reload();
        }, 3000);
      })
      .catch((err) => {
        setErrorMessage(err && err.response && err.response.data && err.response.data.message);
        setShowErrorToast(true);
        setTimeout(() => {
          setShowErrorToast(false);
          setErrorMessage('');
        }, 3000);
      });
  };

  return (
    <div className='w-full mt-4'>
      {showErrorToast && <Toast type={'error'} timeout={5000} message={errorMessage} size='sm' />}

      {showRecomputeToast && (
        <Toast
          type={'success'}
          timeout={5000}
          message={'Recomputing data. Please check back in a few minutes.'}
          size='sm'
        />
      )}
      <div className='flex gap-2 flex-wrap'>
        <input
          type='text'
          placeholder='Type here'
          className='input input-bordered input-sm w-full max-w-xs rounded-none outline-none border-none'
          onChange={(e) => setThresholdValue(e.target.value)}
        />
        <Button
          type='submit'
          onClick={submitForm}
          className='text-white w-[178px] h-8 text-sm bg-blue-900'
        >
          Reset threshold
        </Button>
      </div>
    </div>
  );
};

export default ResetThreshold;
