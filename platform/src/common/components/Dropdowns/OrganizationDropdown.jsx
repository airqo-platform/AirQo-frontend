import { useState } from 'react';
import CustomDropdown from './CustomDropdown';
import CheckIcon from '@/icons/tickIcon';
import ChevronDownIcon from '@/icons/Common/chevron_down.svg';

const splitNameIntoList = (fullName) => {
  // split by space or underscore
  if (fullName) {
    const nameList = fullName.split(/[\s_]+/);
    return nameList;
  }
  return [];
};

const OrganizationDropdown = () => {
  const organizations = [
    {
      org_name: 'mukwano industries jinja',
      org_id: 1,
    },
    {
      org_name: 'kcca',
      org_id: 2,
    },
    {
      org_name: 'airqo',
      org_id: 3,
    },
  ];

  const [selectedOrganization, setSelectedOrganization] = useState(organizations[0]);

  const handleDropdownSelect = (option) => {
    setSelectedOrganization(option);
  };

  return (
    <CustomDropdown
      trigger={
        <button>
          <div className='w-56 h-12 pl-2 pr-3 py-2 bg-white rounded border border-gray-200 justify-between items-center inline-flex'>
            <div className='justify-start items-center gap-3 flex'>
              <div className='w-8 h-8 py-1.5 bg-gray-50 rounded-full justify-center items-center flex gap-3'>
                <div className='w-8 text-center text-slate-500 text-sm font-medium uppercase leading-tight'>
                  {splitNameIntoList(selectedOrganization?.org_name).length > 1
                    ? splitNameIntoList(selectedOrganization?.org_name)[0][0] +
                      splitNameIntoList(selectedOrganization?.org_name)[1][0]
                    : splitNameIntoList(selectedOrganization?.org_name)[0][0]}
                </div>
              </div>
              <div className='pt-0.5 justify-start items-center gap-1 flex'>
                <div
                  className='text-slate-500 text-sm font-medium capitalize leading-tight'
                  title={selectedOrganization?.org_name}
                >
                  {selectedOrganization?.org_name && selectedOrganization?.org_name.length > 16
                    ? selectedOrganization?.org_name.slice(0, 16) + '...'
                    : selectedOrganization?.org_name}
                </div>
              </div>
            </div>
            <ChevronDownIcon />
          </div>
        </button>
      }
      id='options'
      dropStyle={{
        top: '41px',
        zIndex: 999,
        width: '224px',
        maxHeight: '320px',
        overflowY: 'scroll',
        overflowX: 'hidden',
      }}
    >
      {organizations.map((format) => (
        <a
          key={format}
          href='#'
          onClick={() => handleDropdownSelect(format)}
          className={`w-full h-11 px-3.5 py-2.5 justify-between items-center inline-flex ${
            selectedOrganization?.org_name === format?.org_name && 'bg-secondary-neutral-light-50'
          }`}
        >
          <div className='grow shrink basis-0 h-6 justify-start items-center gap-2 flex'>
            <div className='w-8 h-8 py-1.5 bg-gray-50 rounded-full justify-center items-center flex'>
              <div className='w-8 text-center text-slate-500 text-sm font-medium uppercase leading-tight'>
                {splitNameIntoList(format?.org_name).length > 1
                  ? splitNameIntoList(format?.org_name)[0][0] +
                    splitNameIntoList(format?.org_name)[1][0]
                  : splitNameIntoList(format?.org_name)[0][0]}
              </div>
            </div>
            <div className='max-w-[120px] w-full text-gray-700 text-sm font-normal leading-tight capitalize'>
              {format.org_name}
            </div>
          </div>
          {selectedOrganization?.org_name === format?.org_name && <CheckIcon fill='#145FFF' />}
        </a>
      ))}
    </CustomDropdown>
  );
};

export default OrganizationDropdown;
