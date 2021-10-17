import React from 'react';
import classNames from "classnames";

import ArrowDown from 'icons/nav/ArrowDown';

const NavTab = ({ text, width, hideArrow, colored, filled, style }) => (
        <div className={classNames("NavTab", { colored, filled })} style={{ width: width - 32, ...(style || {}) }}>
            <span>{text}</span>
            { !hideArrow && <ArrowDown /> }
        </div>
);

export default NavTab;
