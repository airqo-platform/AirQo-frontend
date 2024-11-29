'use client';
import { useSelector } from '@/hooks';

const MonitorDisplay: React.FC = () => {
  const countryData: any | null = useSelector(
    (state) => state.country.selectedCountry,
  );

  // Get the number of sites (default to 0 if not available)
  const numberOfSites: number = countryData?.numberOfSites || 0;

  // Convert the number to a string and pad with leading zeros up to 4 digits
  const formattedNumber: string[] = numberOfSites
    .toString()
    .padStart(4, '0')
    .split('');

  return (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        {formattedNumber.map((digit, index) => (
          <span
            key={index}
            className="bg-blue-600 text-white px-2 py-1 rounded"
          >
            {digit}
          </span>
        ))}
      </div>
      <p className="text-gray-800">
        Monitors in {countryData?.long_name.replace('_', ' ') || 'Country'}
      </p>
    </div>
  );
};

export default MonitorDisplay;
