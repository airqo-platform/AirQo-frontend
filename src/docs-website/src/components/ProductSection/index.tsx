import React from 'react';
import Link from '@docusaurus/Link';
import { AqCpuChip01, AqServer03, AqBarChartSquarePlus, AqMonitor, AqPhone01, AqDataflow01, AqArrowRight, AqCube02 } from '@airqo/icons-react';
import styles from './styles.module.css';

type ProductItem = {
    title: string;
    description: string;
    link: string;
    Icon: React.ElementType;
};

const ProductList: ProductItem[] = [
    {
        title: 'Analytics',
        description: 'Visualize and analyze air quality data with interactive dashboards and insights',
        link: '/analytics/intro',
        Icon: AqBarChartSquarePlus,
    },
    {
        title: 'Vertex',
        description: "Manage your organization's device lifecycle, from onboarding to real-time status monitoring.",
        link: '/vertex/intro',
        Icon: AqServer03,
    },
    {
        title: 'Beacon',
        description: 'Monitor real-time technical health metrics like battery and signal strength for the sensor network',
        link: '/beacon/intro',
        Icon: AqMonitor,
    },
    {
        title: 'AI Platform',
        description: 'Leverage machine learning for advanced air quality forecasting and spatial analysis',
        link: '/ai-platform/intro',
        Icon: AqCpuChip01,
    },
    {
        title: 'API',
        description: "Access AirQo's air quality data programmatically via our REST API",
        link: '/api/intro',
        Icon: AqDataflow01,
    },
    {
        title: 'AirQo Mobile App',
        description: 'Monitor air quality on the go with personalized recommendations and alerts',
        link: '/mobile-app/intro',
        Icon: AqPhone01,
    },
    {
        title: 'Cross-Product Features',
        description: 'Features that span across multiple products',
        link: '/cross-product/concepts/access-control',
        Icon: AqCube02,
    }
];

function ProductCard({ title, description, link, Icon }: ProductItem) {
    return (
        <Link to={link} className={styles.card}>
            <div className={styles.cardContent}>
                <div className={styles.cardIcon}>
                    <Icon />
                </div>
                <div className={styles.cardText}>
                    <h3 className={styles.cardTitle}>{title}</h3>
                    <p className={styles.cardDescription}>{description}</p>
                </div>
            </div>
            <div className={styles.cardArrow}>
                <AqArrowRight />
            </div>
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
