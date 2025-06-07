import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import Footer from '../components/Footer';
import RightArrowIcon from '@/icons/SideBar/rightArrowIcon';
import BuyDeviceImg from '@/images/carousel/buyDevice.webp';

const AddBuyDeviceHeader = () => (
  <h3
    className="flex items-center text-lg leading-6 font-medium text-gray-300"
    id="modal-title"
  >
    Take Action{' '}
    <RightArrowIcon className="mx-2" width={16} height={16} color="#9EA3AA" />{' '}
    <span className="text-black-600">Install a Device</span>
  </h3>
);

const BuyDevice = ({ onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState('$200');
  const [customAmount, setCustomAmount] = useState('');

  const predefinedDonations = [
    { amount: '$200', label: 'Install 1 Device' },
    { amount: '$400', label: 'Install 2 Device' },
    { amount: '$600', label: 'Install 3 Device' },
    { amount: '$800', label: 'Install 4 Device' },
  ];

  const handleSelection = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    setCustomAmount(e.target.value);
    setSelectedAmount('');
  };

  const handleClearCustomAmount = () => {
    setCustomAmount('');
    setSelectedAmount('$200');
  };

  const getFinalAmount = () => {
    return customAmount ? `$${customAmount}` : selectedAmount;
  };

  const handleSubmit = useCallback(() => {
    const finalAmount = getFinalAmount();
    console.log('Submitting donation', finalAmount);
  }, [selectedAmount, customAmount]);

  const handleClearSelection = useCallback(() => {
    setSelectedAmount('$10');
    setCustomAmount('');
  }, []);

  return (
    <>
      {/* Left side - Image */}
      <div className="w-full md:w-1/2 relative h-[658px]">
        {' '}
        <Image
          src={BuyDeviceImg}
          alt=" Install a Device"
          fill
          style={{ objectFit: 'cover' }}
          className="rounded-l-md"
          loading="eager"
        />
      </div>

      {/* Right side - Donation options */}
      <div className="w-full relative">
        <div className="p-8 flex flex-col space-y-4">
          {predefinedDonations.map((donation) => (
            <button
              key={donation.amount}
              className={`w-full p-7 text-center border rounded-xl text-gray-800 font-medium transition-all ${
                selectedAmount === donation.amount
                  ? 'border-blue-500 border-2 bg-gray-50 ring-1 ring-blue-200'
                  : 'border-gray-300 bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => handleSelection(donation.amount)}
            >
              <span className="font-bold">{donation.amount}</span> —{' '}
              {donation.label}
            </button>
          ))}

          {/* Custom Donation Input with Clear Button */}
          <div className="relative w-full">
            <input
              type="number"
              placeholder="Enter custom donation"
              value={customAmount}
              onChange={handleCustomAmountChange}
              className="w-full p-7 text-center border rounded-xl text-gray-800 font-medium border-gray-300 hover:bg-gray-200"
              min="1"
              step="1"
            />
            {customAmount && (
              <button
                type="button"
                onClick={handleClearCustomAmount}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg text-red-500 hover:text-gray-800"
              >
                &times;
              </button>
            )}
          </div>

          {/* Footer Section */}
          <Footer
            btnText="Continue"
            setError={null}
            errorMessage={null}
            selectedSites={null}
            handleClearSelection={handleClearSelection}
            handleSubmit={handleSubmit}
            onClose={onClose}
          />
        </div>
      </div>
    </>
  );
};

BuyDevice.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export { AddBuyDeviceHeader };
export default BuyDevice;
