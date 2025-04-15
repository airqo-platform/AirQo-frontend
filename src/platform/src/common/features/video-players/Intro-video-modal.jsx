'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTaskProgress } from '@/lib/store/services/checklists/CheckList';
import CloseIcon from '@/icons/close_icon';
import Spinner from '@/components/Spinner';
import Card from '@/components/CardWrapper';
import ErrorBoundary from '@/components/ErrorBoundary'; // Adjust the import path as needed

const VideoModal = ({ open, setOpen, videoUrl }) => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const videoRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const [loading, setLoading] = useState(true);

  const reduxChecklist = useSelector((state) => state.cardChecklist.checklist);
  const videoChecklistItem = reduxChecklist[0];

  const handleClickOutside = useCallback((event) => {
    if (backdropRef.current && !backdropRef.current.contains(event.target)) {
      handleCloseModal();
    }
  }, []);

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

  const handleVideoLoad = () => setLoading(false);
  const handleVideoPause = () => updateVideoState();
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
    <ErrorBoundary name="VideoModal" feature="Video Player">
      <div
        ref={modalRef}
        id="custom-modal"
        tabIndex="-1"
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm"
      >
        <div className="relative w-full max-w-2xl mx-4 md:mx-0">
          {/* Close Button - Now outside the Card */}
          <button
            type="button"
            onClick={handleCloseModal}
            className="absolute -top-4 right-0 z-10 bg-blue-600 hover:bg-blue-700 transition-colors duration-200 rounded-full text-sm w-8 h-8 flex justify-center items-center shadow-md"
            data-modal-hide="custom-modal"
          >
            <CloseIcon fill="#FFFFFF" className="w-4 h-4" />
            <span className="sr-only">Close modal</span>
          </button>

          <Card
            ref={backdropRef}
            width="w-full"
            height="h-[520px]"
            className="animate-slide-in relative transition-all duration-300"
            contentClassName="flex flex-col h-full"
            shadow="shadow-lg"
          >
            {/* Header Section */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-base md:text-xl text-center font-semibold text-gray-900 dark:text-white">
                Introducing AirQo Analytics
              </h1>
            </div>

            {/* Video Container */}
            <div className="flex-grow relative w-full bg-gray-100 dark:bg-gray-800">
              {/* Loading State */}
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-100 dark:bg-gray-800 transition-opacity duration-300">
                  <Spinner className="w-8 h-8" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Loading video...
                  </p>
                </div>
              )}

              {/* Video Player */}
              <div className="w-full h-[432px]">
                <video
                  ref={videoRef}
                  onLoadedMetadata={handleLoadedMetadata}
                  onCanPlayThrough={handleVideoLoad}
                  onPause={handleVideoPause}
                  onEnded={handleVideoEnd}
                  className={`w-full h-full object-contain ${
                    loading ? 'opacity-0' : 'opacity-100'
                  } transition-opacity duration-300`}
                  src={videoUrl}
                  controls
                  autoPlay
                  playsInline
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default VideoModal;
