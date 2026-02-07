import React, { type ReactNode } from 'react';
import DocSidebar from '@theme-original/DocSidebar';
import type DocSidebarType from '@theme/DocSidebar';
import type { WrapperProps } from '@docusaurus/types';
import ProductDropdown from '@site/src/components/ProductDropdown';

type Props = WrapperProps<typeof DocSidebarType>;

export default function DocSidebarWrapper(props: Props): ReactNode {
    return (
        <div className="theme-doc-sidebar-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0.5rem 0.5rem 0 0.5rem', zIndex: 1 }}>
                <ProductDropdown />
            </div>
            <DocSidebar {...props} />
        </div>
    );
}
