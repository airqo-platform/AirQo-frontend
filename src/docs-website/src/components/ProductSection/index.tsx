import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import { AqCpuChip01, AqServer03, AqBarChartSquarePlus, AqMonitor } from '@airqo/icons-react';
import styles from './styles.module.css';

type ProductItem = {
    title: string;
    link: string;
    style: string;
    Icon: React.ElementType;
};

const ProductList: ProductItem[] = [
    {
        title: 'AirQo Analytics',
        link: '/docs/analytics/intro',
        style: styles.analytics,
        Icon: AqBarChartSquarePlus,
    },
    {
        title: 'Vertex',
        link: '/docs/vertex/intro',
        style: styles.vertex,
        Icon: AqServer03, 
    },
    {
        title: 'Beacon',
        link: '/docs/beacon/intro',
        style: styles.beacon,
        Icon: AqMonitor,
    },
    {
        title: 'AI Platform',
        link: '/docs/ai-platform/intro',
        style: styles.aiPlatform,
        Icon: AqCpuChip01,
    },
];

function ProductCard({ title, link, style, Icon }: ProductItem) {
    return (
        <Link to={link} className={clsx(styles.card, style)}>
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
