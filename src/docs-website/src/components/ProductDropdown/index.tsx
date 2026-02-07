import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useHistory } from '@docusaurus/router';
import styles from './styles.module.css';
import {
    AqBarChartSquarePlus,
    AqServer03,
    AqMonitor,
    AqCpuChip01,
    AqDataflow01,
    AqPhone01,
    AqChevronDown,
    AqCheck
} from '@airqo/icons-react';

const Products = [
    {
        title: 'Analytics',
        path: '/docs/analytics',
        icon: AqBarChartSquarePlus,
    },
    {
        title: 'Vertex',
        path: '/docs/vertex',
        icon: AqServer03,
    },
    {
        title: 'Beacon',
        path: '/docs/beacon',
        icon: AqMonitor,
    },
    {
        title: 'AI Platform',
        path: '/docs/ai-platform',
        icon: AqCpuChip01,
    },
    {
        title: 'API',
        path: '/docs/api',
        icon: AqDataflow01,
    },
    {
        title: 'Mobile App',
        path: '/docs/mobile-app',
        icon: AqPhone01,
    }
];

export default function ProductDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const history = useHistory();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentProduct = Products.find(p => location.pathname.startsWith(p.path)) || Products[0];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleProductSelect = (path: string) => {
        history.push(path + '/intro');
        setIsOpen(false);
    };

    return (
        <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button
                className={styles.dropdownButton}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <div className={styles.productInfo}>
                    <div className={styles.productIcon}>
                        <currentProduct.icon />
                    </div>
                    <span>{currentProduct.title}</span>
                </div>
                <div className={styles.dropdownArrow}>
                    <AqChevronDown />
                </div>
            </button>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    {Products.map((product) => (
                        <div
                            key={product.title}
                            className={`${styles.dropdownItem} ${currentProduct.title === product.title ? styles.activeItem : ''}`}
                            onClick={() => handleProductSelect(product.path)}
                        >
                            <div className={styles.productIcon}>
                                <product.icon />
                            </div>
                            <span>{product.title}</span>
                            {currentProduct.title === product.title && (
                                <div className={styles.checkIcon}>
                                    <AqCheck />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
