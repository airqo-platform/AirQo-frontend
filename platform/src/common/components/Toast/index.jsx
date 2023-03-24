import WarningCircleIcon from '@/icons/Common/warning_circle';

const Toast = ({ message, type }) => {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
  };

  const textColor = type === 'success' ? 'text-black-600' : 'text-white-900';

  const containerStyles = `flex p-4 w-80 text-sm ${
    colors[type] || 'bg-red-500'
  } ${textColor} rounded-md shadow-lg transition-opacity`;

  return (
    <div className='fixed top-5 left-0 right-0 z-50 flex justify-center items-center'>
      <div className={containerStyles}>
        {type === 'error' && <WarningCircleIcon fillColor='#FFF' />}
        <p className='ml-2'>{message}</p>
      </div>
    </div>
  );
};

export default Toast;
