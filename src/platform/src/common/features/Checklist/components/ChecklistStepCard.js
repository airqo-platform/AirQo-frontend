import React, { memo } from 'react';
import Link from 'next/link';
import Card from '@/components/CardWrapper';
import CheckIcon from '@/icons/tickIcon';

const ChecklistStepCard = memo(({ stepItem, onClick }) => {
  if (!stepItem) return null;

  const isCompleted = stepItem.completed === true;
  const isInProgress = ['inProgress', 'started'].includes(stepItem.status);
  const isExternal = stepItem.isExternal || stepItem.link?.startsWith('http');
  const hasProgress =
    stepItem.id === 1 && stepItem.videoProgress > 0 && !isCompleted;

  const buttonText = isCompleted
    ? 'Complete'
    : isInProgress
      ? 'Resume'
      : 'Start';
  const buttonColor = isCompleted ? 'text-green-600' : 'text-blue-600';

  const cardStyle = `${isCompleted ? 'border-green-200 bg-green-50' : isInProgress ? 'border-blue-200' : ''}`;

  const StepIcon = () =>
    isCompleted ? (
      <div className="w-12 h-12 flex justify-center items-center rounded-full bg-green-600">
        <CheckIcon fill="#FFFFFF" />
      </div>
    ) : (
      <div className="w-12 h-12 text-lg font-medium flex text-blue-600 justify-center items-center rounded-full bg-blue-50">
        {stepItem.id}
      </div>
    );

  const ProgressBar = () =>
    hasProgress && (
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${stepItem.videoProgress}%` }}
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={stepItem.videoProgress}
        />
      </div>
    );

  const ActionButton = () =>
    isCompleted ? (
      <span className="text-green-600 font-medium">{buttonText}</span>
    ) : (
      <div className="flex gap-4 items-center">
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
      </div>
    );

  return (
    <Card
      width="w-full"
      height="h-full"
      className={cardStyle}
      contentClassName="flex flex-col gap-4"
      padding="p-4"
      data-testid={`checklist-card-${stepItem.id}`}
    >
      {/* Step Icon */}
      <div className="flex items-start">
        <StepIcon />
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

      {/* Progress Bar */}
      <ProgressBar />

      {/* Action Button */}
      <div>
        <ActionButton />
      </div>
    </Card>
  );
});

ChecklistStepCard.displayName = 'ChecklistStepCard';

export default ChecklistStepCard;
