import React from 'react';
import classNames from "classnames";

import ArrowDown from 'icons/nav/ArrowDown';
import { Link } from 'react-router-dom';

const NavTab = ({ text, width, hideArrow, colored, filled, style, path }) => (
        <Link to={path || "/"} style={{textDecoration:"none", color:"#000"}}>
            <div className={classNames("NavTab", { colored, filled })} style={{ width: width - 32, ...(style || {}) }}>
                <span>{text}</span>
                { !hideArrow && <ArrowDown /> }
            </div>
        </Link>
);

export default NavTab;
