import React, { useEffect } from 'react';

const Modal = ({ children, show, closeModal }) => {
  const toggleModal = () => {
    if (show) {
      document.getElementById('modal-wrapper').style.display = 'block';
      document.getElementById('modal-container').style.display = 'block';
    } else {
      document.getElementById('modal-wrapper').style.display = 'none';
      document.getElementById('modal-container').style.display = 'none';
    }
  };

  useEffect(() => {
    toggleModal();
  }, [show]);

  return (
    <div className="modal-wrapper" id="modal-wrapper" onClick={closeModal}>
      <div className="modal-container" id="modal-container">
        {children}
      </div>
    </div>
  );
};

export default Modal;
