import React from 'react';

const HeaderNav = ({ category, component, children }) => {
  return (
    <div className="py-8 flex flex-wrap justify-between items-center gap-4">
      <div>
        <span className="text-xl opacity-50 mr-4">{category}</span>
        <span className="font-mono opacity-10 text-xl mr-4">{'>'}</span>
        <span className="text-xl font-semibold">{component}</span>
      </div>
      <>{children}</>
    </div>
  );
};

export default HeaderNav;
