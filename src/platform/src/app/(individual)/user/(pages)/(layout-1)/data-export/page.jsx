'use client';
import { useCallback } from 'react';
import Modal from '@/features/download-insights-locations';
import { setOpenModal } from '@/lib/store/services/downloadModal';
import { useDispatch, useSelector } from 'react-redux';
import DataExportPage from '@/common/features/download-insights-locations/data-export';

const Page = () => {
  const dispatch = useDispatch();
  const isModalOpen = useSelector((state) => state.modal.openModal);

  const handleCloseModal = useCallback(() => {
    dispatch(setOpenModal(false));
  }, [dispatch]);

  return (
    <div>
      <DataExportPage backToDownload={false} />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default Page;
