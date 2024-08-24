import Link from 'next/link';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export const SideBarDropdownItem = ({ itemLabel, itemPath }) => {
  const router = useRouter();
  const [isMediumDevice, setIsMediumDevice] = useState(false);
  // get current route
  const currentRoute = router.pathname;
  // check if current route contains navPath
  const isCurrentRoute = currentRoute.includes(itemPath);

  const changePath = (e) => {
    e.preventDefault();
    router.push(itemPath);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleMediaQueryChange = (e) => {
      setIsMediumDevice(e.matches);
    };

    setIsMediumDevice(mediaQuery.matches);
    mediaQuery.addListener(handleMediaQueryChange);

    return () => {
      mediaQuery.removeListener(handleMediaQueryChange);
    };
  }, []);

  return (
    <a href={itemPath} onClick={changePath}>
      <div className={`h-10 flex items-start`}>
        {(!isMediumDevice || itemLabel) && (
          <h3
            className={`text-sm leading-[21px] ${isCurrentRoute && 'text-blue-600'}`}
          >
            {itemLabel}
          </h3>
        )}
      </div>
    </a>
  );
};

const SidebarItem = ({
  Icon,
  label,
  navPath,
  children,
  onClick,
  toggleMethod,
  toggleState,
  iconOnly = false,
}) => {
  const router = useRouter();
  const currentRoute = router.pathname;
  const isCurrentRoute =
    currentRoute === navPath || (navPath === '/Home' && currentRoute === '/');
  const hasDropdown = !!children;

  const commonClasses = `
    cursor-pointer
    transition-all duration-300 ease-in-out
    ${isCurrentRoute ? 'text-blue-600' : 'text-gray-800'}
    ${toggleState ? 'bg-sidebar-blue rounded-xl' : ''}
  `;

  const iconColor = isCurrentRoute ? '#145FFF' : '#1C1D20';

  const renderIcon = () => (
    <div
      className={`flex items-center justify-center ${iconOnly ? 'w-12 h-12' : 'w-8 h-8 mr-4'}`}
    >
      {Icon && <Icon fill={iconColor} />}
    </div>
  );

  const renderContent = () => (
    <>
      {!iconOnly && (
        <div className="flex-grow">
          <h3
            className={`font-medium ${isCurrentRoute ? 'text-blue-600' : 'font-normal'}`}
          >
            {label}
          </h3>
        </div>
      )}
      {hasDropdown && !iconOnly && (
        <ArrowDropDownIcon fillColor={toggleState ? '#145FFF' : '#1C1D20'} />
      )}
    </>
  );

  return (
    <div
      className={commonClasses}
      role="button"
      tabIndex={0}
      onClick={hasDropdown ? toggleMethod : onClick}
    >
      <Link href={navPath || '#'}>
        <div
          className={`
          relative flex items-center
          ${iconOnly ? 'p-0' : 'p-3 w-full'}
          ${isCurrentRoute ? 'bg-primary-50' : 'hover:bg-gray-100'}
          rounded-xl
        `}
        >
          {isCurrentRoute && (
            <div className="absolute -left-2 h-1/3 w-1 bg-blue-600 rounded-xl" />
          )}
          {renderIcon()}
          {renderContent()}
        </div>
      </Link>
      {toggleState && children && (
        <div className="ml-12 mt-2 space-y-2">{children}</div>
      )}
    </div>
  );
};

SideBarDropdownItem.propTypes = {
  itemLabel: PropTypes.string.isRequired,
  itemPath: PropTypes.string.isRequired,
};

SidebarItem.propTypes = {
  Icon: PropTypes.elementType,
  label: PropTypes.string.isRequired,
  navPath: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  children: PropTypes.node,
  toggleMethod: PropTypes.func,
  toggleState: PropTypes.bool,
  iconOnly: PropTypes.bool,
};

export default SidebarItem;
