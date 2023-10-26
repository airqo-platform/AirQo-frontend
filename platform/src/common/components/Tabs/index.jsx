import React, { useState } from 'react';

function Tabs({ children, childrenRight }) {
  const [activeTab, setActiveTab] = useState(0);
  const childrenArray = React.Children.toArray(children);

  return (
    <div data-testid='tabs'>
      <div
        className={`px-4 lg:px-16 mb-4 border-b border-grey-200 ${
          childrenRight && 'flex justify-between flex-wrap'
        }`}>
        <ul className='flex flex-wrap gap-6 text-sm font-medium text-center'>
          {childrenArray.map((child, index) => (
            <li
              key={index}
              role='presentation'
              className={`${
                activeTab === index
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent opacity-40 hover:text-grey hover:border-grey-200 text-secondary-neutral-light-400'
              } whitespace-nowrap py-2 border-b-2 rounded-tl-full rounded-tr-full font-medium text-sm focus:outline-none mr-2 cursor-pointer`}
              onClick={() => setActiveTab(index)}>
              {child.props.label}
            </li>
          ))}
        </ul>
        <div className='mb-2'>
          {childrenRight && childrenRight[activeTab] && childrenRight[activeTab].children}
        </div>
      </div>
      <div>{children[activeTab]}</div>
    </div>
  );
}

export default Tabs;
