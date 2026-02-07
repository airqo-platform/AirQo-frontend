import React from 'react';
import Link from '@docusaurus/Link';
import { AqCpuChip01, AqServer03, AqBarChartSquarePlus, AqMonitor, AqPhone01 } from '@airqo/icons-react';
import styles from './styles.module.css';

type ProductItem = {
    title: string;
    link: string;
    Icon: React.ElementType;
};

const ProductList: ProductItem[] = [
    {
        title: 'Analytics',
        link: '/docs/analytics/intro',
        Icon: AqBarChartSquarePlus,
    },
    {
        title: 'Vertex',
        link: '/docs/vertex/intro',
        Icon: AqServer03, 
    },
    {
        title: 'Beacon',
        link: '/docs/beacon/intro',
        Icon: AqMonitor,
    },
    {
        title: 'AI Platform',
        link: '/docs/ai-platform/intro',
        Icon: AqCpuChip01,
    },
    {
        title: 'AirQo Mobile App',
        link: '/docs/mobile-app/intro',
        Icon: AqPhone01,
    }
];

function ProductCard({ title, link, Icon }: ProductItem) {
    return (
        <Link to={link} className={styles.card}>
            <div className={styles.cardIcon}>
                <Icon />
            </div>
            <h3 className={styles.cardTitle}>{title}</h3>
        </Link>
    );
}

export default function ProductSection(): React.ReactNode {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {ProductList.map((props, idx) => (
                        <ProductCard key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
