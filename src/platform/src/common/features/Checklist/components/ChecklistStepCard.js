import React, { memo } from 'react';
import Link from 'next/link';
import Card from '@/components/CardWrapper';
import CheckIcon from '@/icons/tickIcon';

const ChecklistStepCard = memo(({ stepItem, onClick }) => {
  if (!stepItem) return null;

  // Determine card state
  const isCompleted = stepItem.completed === true;
  const isInProgress =
    stepItem.status === 'inProgress' || stepItem.status === 'started';
  const isExternal = stepItem.isExternal || stepItem.link?.startsWith('http');

  // Determine button text based on status
  const buttonText = isCompleted
    ? 'Complete'
    : isInProgress
      ? 'Resume'
      : 'Start';
  const buttonColor = isCompleted ? 'text-green-600' : 'text-blue-600';

  // Video progress for step 1
  const hasProgress =
    stepItem.id === 1 && stepItem.videoProgress > 0 && !isCompleted;
  const progressWidth = hasProgress ? `${stepItem.videoProgress}%` : '0%';

  // Card styling based on status
  const cardStyle = isCompleted
    ? 'border-green-200 bg-green-50'
    : isInProgress
      ? 'border-blue-200'
      : '';

  return (
    <Card
      width="w-full"
      height="h-full"
      className={cardStyle}
      contentClassName="space-y-4"
      padding="py-4 px-3"
      data-testid={`checklist-card-${stepItem.id}`}
    >
      {/* Step Icon */}
      <div>
        {isCompleted ? (
          <div className="w-14 h-14 flex justify-center items-center rounded-full bg-green-600">
            <CheckIcon fill="#FFFFFF" />
          </div>
        ) : (
          <div className="w-14 h-14 flex justify-center items-center rounded-full bg-[#F5F5FF]">
            <span className="text-blue-600 text-lg font-medium">
              {stepItem.id}
            </span>
          </div>
        )}
      </div>

      {/* Step Content */}
      <div>
        <p className="text-base font-medium">
          {stepItem.title || stepItem.label}
        </p>
        {stepItem.description && (
          <p className="text-sm text-gray-500 mt-1">{stepItem.description}</p>
        )}
      </div>

      {/* Progress Bar (for video step) */}
      {hasProgress && (
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full"
            style={{ width: progressWidth }}
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={stepItem.videoProgress}
          />
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-between items-center">
        {isCompleted ? (
          <span className="text-green-600 font-medium ml-auto">
            {buttonText}
          </span>
        ) : (
          <>
            <Link
              href={stepItem.link || '#'}
              target={isExternal ? '_blank' : '_self'}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              onClick={(e) => {
                if (stepItem.id === 1 || stepItem.link === '#') {
                  e.preventDefault();
                }
                onClick(stepItem);
              }}
              className={`${buttonColor} font-medium hover:underline cursor-pointer`}
              data-testid={`checklist-action-${stepItem.id}`}
            >
              {buttonText}
            </Link>
            <span className="text-sm text-gray-500">{stepItem.time}</span>
          </>
        )}
      </div>
    </Card>
  );
});

ChecklistStepCard.displayName = 'ChecklistStepCard';

export default ChecklistStepCard;
