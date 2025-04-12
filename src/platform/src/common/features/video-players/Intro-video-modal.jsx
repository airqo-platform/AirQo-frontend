import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  completeTask,
  updateVideoProgress,
} from '@/lib/store/services/checklists/CheckList';
import CloseIcon from '@/icons/close_icon';
import Spinner from '@/components/Spinner';
import Card from '@/components/CardWrapper';

const VideoModal = ({ open, setOpen, videoUrl, checklistData }) => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Memoize the click handler to avoid re-adding event listeners unnecessarily.
  const handleClickOutside = useCallback(
    (event) => {
      if (backdropRef.current && !backdropRef.current.contains(event.target)) {
        setOpen(false);
        if (videoRef.current) {
          dispatch(
            updateVideoProgress({
              id: 1,
              videoProgress: videoRef.current.currentTime,
            }),
          );
        }
      }
    },
    [dispatch, setOpen],
  );

  useEffect(() => {
    if (open) {
      // Set focus to the modal for accessibility.
      modalRef.current?.focus();

      // Add event listener for clicks outside the modal.
      document.addEventListener('mousedown', handleClickOutside);

      // Restore video progress if available.
      const videoTime = checklistData.find(
        (card) => card.title === 'analytics_video',
      )?.videoProgress;
      if (videoTime && videoRef.current) {
        videoRef.current.currentTime = videoTime;
      }
    }

    // Cleanup function removes event listener.
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, checklistData, handleClickOutside]);

  const handleVideoLoad = () => {
    setLoading(false);
  };

  const handleVideoPause = () => {
    if (videoRef.current) {
      dispatch(
        updateVideoProgress({
          id: 1,
          videoProgress: videoRef.current.currentTime,
        }),
      );
    }
  };

  const handleVideoEnd = () => {
    dispatch(updateVideoProgress({ id: 1, videoProgress: 0 }));
    dispatch(completeTask(1));
  };

  // Close modal handler for the close button.
  const handleCloseModal = () => {
    setOpen(false);
    if (videoRef.current) {
      dispatch(
        updateVideoProgress({
          id: 1,
          videoProgress: videoRef.current.currentTime,
        }),
      );
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      ref={modalRef}
      id="custom-modal"
      tabIndex="-1"
      className={`fixed inset-0 z-50 flex items-center justify-center transform transition-transform duration-300 ${
        open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      } bg-gray-800 bg-opacity-50`}
    >
      <Card
        ref={backdropRef}
        width="w-full max-w-2xl"
        height="h-auto min-h-[384px]"
        className="mx-4 md:mx-0 animate-slide-in relative"
        padding="p-4"
      >
        <h1 className="text-sm md:text-xl w-full text-center font-medium text-gray-900 dark:text-white p-3">
          Introducing AirQo Analytics
        </h1>
        <button
          type="button"
          onClick={handleCloseModal}
          className="absolute top-0 right-0 md:-top-[25px] md:-right-[24px] m-2 text-gray-400 bg-blue-600 hover:bg-blue-900 hover:text-gray-900 rounded-full text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
          data-modal-hide="custom-modal"
        >
          <CloseIcon fill="#FFFFFF" />
          <span className="sr-only">Close modal</span>
        </button>
        <div className="w-full h-full max-h-[384px] relative">
          {loading && (
            <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
              <Spinner />
            </div>
          )}
          <video
            ref={videoRef}
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
