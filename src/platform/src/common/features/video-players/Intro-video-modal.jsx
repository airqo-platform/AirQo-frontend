'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { updateTaskProgress } from '@/lib/store/services/checklists/CheckList';
import { AqXClose } from '@airqo/icons-react';
import Spinner from '@/common/components/Spinner';
import ReusableDialog from '@/common/components/Modal/ReusableDialog';
import ErrorBoundary from '@/common/components/ErrorBoundary';

const VideoModal = ({ open, setOpen, videoUrl }) => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const reduxChecklist = useSelector((state) => state.cardChecklist.checklist);
  const videoChecklistItem = reduxChecklist[0];

  // Get user session
  const { data: session } = useSession();
  // Get userId from session only - no localStorage fallback needed
  const getUserId = useCallback(() => {
    return session?.user?.id || null;
  }, [session]);

  // Calculate and update video progress - only called on pause, end, or close
  const updateVideoState = useCallback(() => {
    if (!videoRef.current || !videoChecklistItem?._id) return;

    // Get user ID from NextAuth session or fallback
    const userId = getUserId();
    if (!userId) {
      // No user ID available for updating video progress
      return;
    }

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 1;
    const progressPercent = Math.round((currentTime / duration) * 100);

    dispatch(
      updateTaskProgress({
        _id: videoChecklistItem._id,
        videoProgress: progressPercent,
        userId: userId,
        status:
          videoChecklistItem.status === 'not started'
            ? 'inProgress'
            : videoChecklistItem.status,
      }),
    );
  }, [dispatch, videoChecklistItem, getUserId]);

  // Seek to last progress when video loads
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current && videoChecklistItem?.videoProgress) {
      const duration = videoRef.current.duration;
      videoRef.current.currentTime =
        (videoChecklistItem.videoProgress / 100) * duration;
    }
  }, [videoChecklistItem]);

  // Close handlers - simplified since we have dedicated backdrop
  const handleClickOutside = useCallback((event) => {
    // Only check if clicking on the modal content area, not the backdrop
    if (backdropRef.current && !backdropRef.current.contains(event.target)) {
      event.stopPropagation();
    }
  }, []);

  // Update progress and close modal
  const handleCloseModal = useCallback(() => {
    updateVideoState();
    setOpen(false);
  }, [updateVideoState, setOpen]);

  // Setup event listeners and cleanup
  useEffect(() => {
    if (open) {
      modalRef.current?.focus();
      document.addEventListener('mousedown', handleClickOutside);

      // Add keyboard ESC support
      const handleEscapeKey = (event) => {
        if (event.key === 'Escape') {
          handleCloseModal();
        }
      };
      document.addEventListener('keydown', handleEscapeKey);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [open, handleClickOutside, handleCloseModal]);

  // Handle video pause event - update progress
  const handleVideoPause = useCallback(() => {
    updateVideoState();
  }, [updateVideoState]);

  // Handle video end event - mark as completed
  const handleVideoEnd = useCallback(() => {
    if (!videoChecklistItem?._id) return;

    const userId = getUserId();
    if (!userId) {
      // No user ID available for completing video task
      return;
    }

    dispatch(
      updateTaskProgress({
        _id: videoChecklistItem._id,
        status: 'completed',
        completed: true,
        videoProgress: 100,
        completionDate: new Date().toISOString(),
        userId: userId,
      }),
    );
  }, [dispatch, videoChecklistItem, getUserId]);

  // Handle video load events
  const handleVideoLoad = () => setLoading(false);

  if (!open) return null;
  return (
    <ErrorBoundary name="VideoModal" feature="Video Player">
      <ReusableDialog
        isOpen={open}
        onClose={handleCloseModal}
        ariaLabel="Intro Video Modal"
        className="z-[9999]"
        size="max-w-2xl w-full"
        maxHeight="h-auto"
        contentClassName="flex flex-col"
        contentAreaClassName="px-0 flex-1"
        hideCloseIcon={true}
        customHeader={
          <div>
            <h1 className="text-base md:text-xl text-center font-semibold text-gray-900 dark:text-white">
              Introducing AirQo Analytics
            </h1>
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-3 right-4 z-20 bg-primary hover:bg-primary/70 transition-colors duration-200 rounded-full text-sm w-8 h-8 flex justify-center items-center shadow-md"
              data-modal-hide="custom-modal"
              tabIndex={0}
            >
              <AqXClose color="#FFFFFF" className="w-4 h-4" />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
        }
      >
        <div className="flex-grow relative w-full">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-800 transition-opacity duration-300 z-10">
              <Spinner className="w-8 h-8" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Loading video...
              </p>
            </div>
          )}
          <div className="w-full h-[432px] rounded-b-lg overflow-hidden">
            <video
              ref={videoRef}
              onLoadedMetadata={handleLoadedMetadata}
              onCanPlayThrough={handleVideoLoad}
              onPause={handleVideoPause}
              onEnded={handleVideoEnd}
              className={`w-full h-full object-contain bg-black ${
                loading ? 'opacity-0' : 'opacity-100'
              } transition-opacity duration-300`}
              src={videoUrl}
              controls
              autoPlay
              playsInline
              preload="metadata"
            />
          </div>
        </div>
      </ReusableDialog>
    </ErrorBoundary>
  );
};

export default VideoModal;
