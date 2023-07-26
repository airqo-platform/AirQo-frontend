import Button from '@/components/Button';
import { useState } from 'react';
import { resetCollocationBatch } from '@/core/apis/Collocation';
import Toast from '@/components/Toast';

const ResetThreshold = ({ closeForm, batchId, type }) => {
  const [thresholdValue, setThresholdValue] = useState('');
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showRecomputeToast, setShowRecomputeToast] = useState(false);

  const submitForm = (e) => {
    e.preventDefault();

    let body = {};

    switch (type) {
      case 'intra_correlation':
        body = {
          intra_correlation_threshold: thresholdValue,
        };
        break;
      case 'inter_correlation':
        body = {
          inter_correlation_threshold: thresholdValue,
        };
        break;
      case 'differences':
        body = {
          differences_threshold: thresholdValue,
        };
        break;
      case 'data_completeness':
        body = {
          data_completeness_threshold: thresholdValue,
        };
        break;
      default:
        break;
    }

    resetCollocationBatch({ data_completeness_threshold: thresholdValue }, { batchId })
      .then((res) => {
        setShowRecomputeToast(true);
        closeForm();
      })
      .catch((err) => {
        setErrorMessage(err.response.data.message);
        setShowErrorToast(true);
      });

    setShowErrorToast(false);
    setErrorMessage('');
    setShowRecomputeToast(false);
  };

  return (
    <div className='w-full mt-4'>
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
      {showErrorToast && <Toast type={'error'} timeout={5000} message={errorMessage} size='sm' />}

      {showRecomputeToast && (
        <Toast
          type={'success'}
          timeout={5000}
          message={'Recomputing data. Please check back in a few minutes.'}
          size='sm'
        />
      )}
    </div>
  );
};

export default ResetThreshold;
