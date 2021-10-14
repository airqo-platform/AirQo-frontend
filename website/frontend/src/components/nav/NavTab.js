import React from 'react';
import classNames from "classnames";

import ArrowDown from 'icons/nav/ArrowDown';

const NavTab = ({ text, width, hideArrow, colored, filled }) => (
        <div className={classNames("NavTab", { colored, filled })} style={{ width: width - 32 }}>
            <span>{text}</span>
            { !hideArrow && <ArrowDown /> }
        </div>
);

export default NavTab;
