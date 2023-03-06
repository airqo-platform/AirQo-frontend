import ToastError from './error';
import ToastSuccess from './success';
import ToastWarning from './warning';

const Toast = ({ variant, message }) => {
  if (variant === 'error') {
    return <ToastError message={message} />;
  }

  if (variant === 'success') {
    return <ToastSuccess message={message} />;
  }

  if (variant === 'warning') {
    return <ToastWarning message={message} />;
  }
};

export default Toast;
