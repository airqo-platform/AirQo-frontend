import { AqLoading01 } from '@airqo/icons-react';

const Spinner = ({ size }) => (
  <div className="text-center">
    <div role="status">
      <AqLoading01 size={size} className="animate-spin text-primary" />

      <span className="sr-only">Loading...</span>
    </div>
  </div>
);

export default Spinner;
