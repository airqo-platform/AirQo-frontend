import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTaskProgress } from '@/lib/store/services/checklists/CheckList';
import CloseIcon from '@/icons/close_icon';
import Spinner from '@/components/Spinner';
import Card from '@/components/CardWrapper';

const VideoModal = ({ open, setOpen, videoUrl }) => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const videoRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const [loading, setLoading] = useState(true);

  // Get the video checklist item from Redux (assuming the first item is the video)
  const reduxChecklist = useSelector((state) => state.cardChecklist.checklist);
  const videoChecklistItem = reduxChecklist[0];

  // Handler to close modal when clicking outside
  const handleClickOutside = useCallback((event) => {
    if (backdropRef.current && !backdropRef.current.contains(event.target)) {
      handleCloseModal();
    }
  }, []);

  // Throttled updateVideoState: call at most once per 1000 ms
  const updateVideoState = useCallback(() => {
    if (!videoRef.current || !videoChecklistItem?._id) return;
    const now = Date.now();
    if (now - lastUpdateRef.current < 1000) return;
    lastUpdateRef.current = now;

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 1;
    const progressPercent = Math.round((currentTime / duration) * 100);
    dispatch(
      updateTaskProgress({
        _id: videoChecklistItem._id,
        videoProgress: progressPercent,
        status:
          videoChecklistItem.status === 'not started'
            ? 'inProgress'
            : videoChecklistItem.status,
      }),
    );
  }, [dispatch, videoChecklistItem]);

  // Set video position once metadata is loaded
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current && videoChecklistItem?.videoProgress) {
      const duration = videoRef.current.duration;
      videoRef.current.currentTime =
        (videoChecklistItem.videoProgress / 100) * duration;
    }
  }, [videoChecklistItem]);

  useEffect(() => {
    if (open) {
      modalRef.current?.focus();
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, handleClickOutside]);

  // Video event handlers
  const handleVideoLoad = () => setLoading(false);
  const handleVideoPause = () => {
    updateVideoState();
  };
  const handleVideoEnd = () => {
    if (!videoChecklistItem?._id) return;
    dispatch(
      updateTaskProgress({
        _id: videoChecklistItem._id,
        status: 'completed',
        completed: true,
        videoProgress: 100,
        completionDate: new Date().toISOString(),
      }),
    );
  };

  const handleCloseModal = () => {
    updateVideoState();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      ref={modalRef}
      id="custom-modal"
      tabIndex="-1"
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50"
    >
      <Card
        ref={backdropRef}
        width="w-full max-w-2xl"
        height="h-[384px]"
        className="mx-4 md:mx-0 animate-slide-in relative"
        padding="p-4"
      >
        <h1 className="text-sm md:text-xl w-full text-center font-medium text-gray-900 dark:text-white p-3">
          Introducing AirQo Analytics
        </h1>
        <button
          type="button"
          onClick={handleCloseModal}
          className="absolute top-0 right-0 md:-top-[25px] md:-right-[24px] m-2 text-gray-400 bg-blue-600 hover:bg-blue-900 rounded-full text-sm w-8 h-8 inline-flex justify-center items-center"
          data-modal-hide="custom-modal"
        >
          <CloseIcon fill="#FFFFFF" />
          <span className="sr-only">Close modal</span>
        </button>
        <div className="w-full h-[384px] relative">
          {loading && (
            <div className="absolute inset-0 flex justify-center items-center">
              <Spinner />
            </div>
          )}
          <video
            ref={videoRef}
            onLoadedMetadata={handleLoadedMetadata}
            onCanPlayThrough={handleVideoLoad}
            onPause={handleVideoPause}
            onEnded={handleVideoEnd}
            className={`w-full h-full ${loading ? 'hidden' : 'block'}`}
            src={videoUrl}
            controls
            autoPlay
          />
        </div>
      </Card>
    </div>
  );
};

export default VideoModal;
