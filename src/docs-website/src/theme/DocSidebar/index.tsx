import React from 'react';
import DocSidebar from '@theme-original/DocSidebar';
import ProductDropdown from '@site/src/components/ProductDropdown';

export default function DocSidebarWrapper(props) {
    return (
        <div className="theme-doc-sidebar-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0.5rem 0.5rem 0 0.5rem', zIndex: 1 }}>
                <ProductDropdown />
            </div>
            <DocSidebar {...props} />
        </div>
    );
}
