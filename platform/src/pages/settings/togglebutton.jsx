import React from 'react';

const ToggleButton = ({ isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`w-9 h-5 mt-1 bg-${isSelected ? 'blue-500' : 'gray-200'} rounded-full cursor-pointer transition-all duration-500 flex items-center`}
    >
      <div
        className={`h-4 w-4 bg-white rounded-full transition-all duration-500 ${
          isSelected ? 'ml-4' : 'ml-0.5'
        }`}
      ></div>
    </div>
  );
};

export default ToggleButton;




