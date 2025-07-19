import PropTypes from 'prop-types';
import CardWrapper from '@/common/components/CardWrapper';

const SettingsTabNavigation = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <CardWrapper
      className={`border-b rounded-lg ${className}`}
      radius="rounded-lg"
      padding="p-0"
      shadow=""
    >
      <nav
        className="-mb-px flex space-x-8 px-6"
        aria-label="Settings Navigation"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
              title={tab.description}
            >
              {Icon && (
                <Icon
                  className={`
                    -ml-0.5 mr-2 h-4 w-4 transition-colors duration-200
                    ${
                      isActive
                        ? 'text-primary'
                        : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                    }
                  `}
                  aria-hidden="true"
                />
              )}
              {tab.name}
            </button>
          );
        })}
      </nav>
    </CardWrapper>
  );
};

SettingsTabNavigation.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
      description: PropTypes.string,
    }),
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default SettingsTabNavigation;
