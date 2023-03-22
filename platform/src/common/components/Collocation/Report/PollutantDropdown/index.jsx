import Button from '@/components/Button';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';

const PollutantDropdown = ({ pollutantValue, handlePollutantChange, options }) => {
  const handleOptionClick = (option) => {
    handlePollutantChange(option.value);
  };

  return (
    <div className='dropdown w-full ml-4 mb-5'>
      <Button className={'mb-1 h-9 w-auto text-black font-medium text-sm'}>
        <div className='mr-1 text-xs'>
          <span>PM</span>
          <sub>{pollutantValue}</sub>
        </div>
        <span className='flex items-center justify-center bg-grey-700 h-4 w-4 rounded-lg'>
          <ArrowDropDownIcon fillColor='#000000' width='5.71' height='3' />
        </span>
      </Button>
      <ul tabIndex={0} className='dropdown-content menu p-2 shadow bg-base-100 rounded-box w-44'>
        {options.map((option) => (
          <li
            role='button'
            key={option.value}
            onClick={() => handleOptionClick(option)}
            className='text-sm text-grey leading-5'
          >
            <a>{option.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PollutantDropdown;
