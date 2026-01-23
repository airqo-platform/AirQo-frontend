interface BillboardHeaderProps {
  hideControls?: boolean;
}

const BillboardHeader = ({ hideControls }: BillboardHeaderProps) => {
  if (hideControls) return null;

  return (
    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="font-bold text-lg sm:text-xl">Air Quality</div>
        <div className="text-xs sm:text-sm opacity-90 flex items-center gap-2 flex-wrap">
          <span>
            {new Date().toLocaleDateString([], {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <span>
            {new Date().toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BillboardHeader;
