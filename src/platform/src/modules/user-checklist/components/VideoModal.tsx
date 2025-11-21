'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import ReusableDialog from '@/shared/components/ui/dialog';
import { useSession } from 'next-auth/react';
import { useUserChecklist } from '@/shared/hooks/useChecklist';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoProgress?: (progress: number) => void;
  onVideoComplete?: () => void;
  onVideoPause?: () => void;
  initialProgress?: number;
}

const ANALYTICS_VIDEO_URL =
  'https://res.cloudinary.com/dbibjvyhm/video/upload/v1730840120/Analytics/videos/Airqo_Tech_video_cc8chw.mp4';

const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  onVideoProgress,
  onVideoComplete,
  onVideoPause,
  initialProgress = 0,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedProgressRef = useRef(0);
  const { data: session } = useSession();

  // Get user ID from session
  const userId = React.useMemo(() => {
    if (!session?.user) return null;
    const user = session.user as unknown as {
      id?: string;
      _id?: string;
      userId?: string;
    };
    return user.id || user._id || user.userId || null;
  }, [session]);

  // Get checklist data using the hook
  const { data: checklistData } = useUserChecklist(userId);

  // Extract video progress and completion status from the first checklist item (index 0 - analytics video)
  const checklistVideoProgress = React.useMemo(() => {
    if (!checklistData?.checklists?.[0]?.items?.[0]) return 0;
    return checklistData.checklists[0].items[0].videoProgress || 0;
  }, [checklistData]);

  // Check if the video is already completed
  const isVideoCompleted = React.useMemo(() => {
    if (!checklistData?.checklists?.[0]?.items?.[0]) return false;
    const item = checklistData.checklists[0].items[0];
    return item.completed === true || item.status === 'completed';
  }, [checklistData]);

  // Use checklist progress if available, otherwise fall back to prop
  const effectiveInitialProgress = checklistVideoProgress || initialProgress;

  // Calculate current progress percentage
  const getCurrentProgress = useCallback((): number => {
    const video = videoRef.current;
    if (!video || !video.duration) return 0;
    return (video.currentTime / video.duration) * 100;
  }, []);

  // Save progress immediately (for pause, close, end events)
  const saveProgressImmediate = useCallback(() => {
    // Don't save progress if video is already completed
    if (isVideoCompleted) return;

    const currentProgress = getCurrentProgress();
    lastSavedProgressRef.current = currentProgress;
    onVideoProgress?.(currentProgress);
  }, [getCurrentProgress, onVideoProgress, isVideoCompleted]);

  // Continuous progress tracking during playback
  const handleTimeUpdate = useCallback(() => {
    // Progress is only saved on key events (pause, close, completion) to avoid API overload
    // No saving during playback - only track locally
    const video = videoRef.current;
    if (!video || video.paused || video.ended || isVideoCompleted) return;

    // Just update local progress tracking, don't save to API during playback
  }, [isVideoCompleted]);

  // Event handlers
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    // If video is completed, start from beginning or don't restore progress
    if (isVideoCompleted) {
      video.currentTime = 0;
      return;
    }

    // Restore progress when metadata is loaded (duration is available)
    if (effectiveInitialProgress > 0 && effectiveInitialProgress < 100) {
      const resumeTime = (effectiveInitialProgress / 100) * video.duration;
      video.currentTime = resumeTime;
      lastSavedProgressRef.current = effectiveInitialProgress;
    }
  }, [effectiveInitialProgress, isVideoCompleted]);

  const handleCanPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // Don't autoplay if video is already completed
    if (isVideoCompleted) return;

    // Attempt autoplay with audio
    video.muted = false;
    video.play().catch(() => {
      // If autoplay fails, try muted
      video.muted = true;
      video.play().catch((error: Error) => {
        console.error('Video autoplay failed:', error);
      });
    });
  }, [isVideoCompleted]);

  const handlePause = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.ended) return;

    saveProgressImmediate();
    onVideoPause?.();
  }, [saveProgressImmediate, onVideoPause]);

  const handleEnded = useCallback(() => {
    // Don't update if video is already completed
    if (isVideoCompleted) return;

    // Mark as 100% complete
    lastSavedProgressRef.current = 100;
    onVideoProgress?.(100);
    onVideoComplete?.();
  }, [onVideoProgress, onVideoComplete, isVideoCompleted]);

  // Initialize progress when modal opens and data is available
  const initializeProgress = useCallback(() => {
    if (
      isOpen &&
      checklistData &&
      effectiveInitialProgress > 0 &&
      !isVideoCompleted
    ) {
      lastSavedProgressRef.current = effectiveInitialProgress;
    }
  }, [isOpen, checklistData, effectiveInitialProgress, isVideoCompleted]);

  useEffect(() => {
    initializeProgress();
  }, [initializeProgress]);

  // Setup event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isOpen) return;

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [
    isOpen,
    handleLoadedMetadata,
    handleCanPlay,
    handlePause,
    handleEnded,
    handleTimeUpdate,
  ]);

  // Handle modal close with progress saving
  const handleClose = useCallback(() => {
    saveProgressImmediate();
    onClose();
  }, [saveProgressImmediate, onClose]);

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Analytics Video"
      size="xl"
      showCloseButton={true}
      contentAreaClassName="p-0"
      className="border-none outline-none"
    >
      <div className="relative w-full h-[300px] flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={ANALYTICS_VIDEO_URL}
          controls
          className="w-full h-full object-contain"
          preload="metadata"
        />
      </div>
    </ReusableDialog>
  );
};

export default VideoModal;
