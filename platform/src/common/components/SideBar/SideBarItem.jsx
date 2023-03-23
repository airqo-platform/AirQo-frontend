import Link from 'next/link';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import { theme } from '../../../../tailwind.config';
import { useRouter } from 'next/router';

export const SideBarDropdownItem = ({ itemLabel, itemPath }) => {
  const router = useRouter();

  const changePath = (e) => {
    e.preventDefault();

    router.push(itemPath);
  };
  return (
    <a href={itemPath} onClick={changePath}>
      <span
        className={`h-10 pl-12 flex items-center ${
          itemPath
            ? 'hover:bg-light-blue hover:text-blue'
            : 'hover:bg-grey-900 hover:opacity-50 hover:cursor-not-allowed'
        }`}
      >
        <h3 className={`text-sm text-grey leading-[21px]`}>{itemLabel}</h3>
      </span>
    </a>
  );
};

const SideBarItem = ({ Icon, label, dropdown, navPath, children, toggleMethod, toggleState }) => {
  return (
    <div
      className={`cursor-pointer ${toggleState && 'bg-sidebar-blue rounded'}`}
      role='button'
      tabIndex={0}
      onClick={dropdown && toggleMethod}
    >
      <Link href={navPath || ''}>
        <div className={`flex items-center justify-between w-full h-12 hover:cursor-pointer mt-2`}>
          <div className='flex items-center'>
            <div className='w-8 h-8 rounded-full flex items-center justify-center mr-4'>
              <Icon />
            </div>

            <h3
              className={`text-base font-normal text-black-900 ${
                toggleState && 'text-blue font-medium'
              }`}
            >
              {label}
            </h3>
          </div>
          {dropdown && (
            <div className='mr-6'>
              <ArrowDropDownIcon fillColor={toggleState && theme.extend.colors.blue[900]} />
            </div>
          )}
        </div>
      </Link>

      {toggleState && <div className='flex flex-col'>{children}</div>}
    </div>
  );
};

export default SideBarItem;
