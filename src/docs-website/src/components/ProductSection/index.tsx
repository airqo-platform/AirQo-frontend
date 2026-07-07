import React from 'react';
import Link from '@docusaurus/Link';
import { AqCpuChip01, AqServer03, AqBarChartSquarePlus, AqMonitor, AqPhone01, AqDataflow01, AqArrowRight, AqDatabase01 } from '@airqo/icons-react';
import styles from './styles.module.css';

type ProductItem = {
    title: string;
    description: string;
    link: string;
    Icon: React.ElementType;
    disabled?: boolean;
};

const ProductList: ProductItem[] = [
    {
        title: 'Nexus',
        description: 'Visualize and analyze air quality data with interactive dashboards and insights',
        link: '/nexus/intro',
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
        disabled: true,
    },
    {
        title: 'AI Platform',
        description: 'Leverage machine learning for advanced air quality forecasting and spatial analysis',
        link: '/ai-platform/intro',
        Icon: AqCpuChip01,
        disabled: true,
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
        disabled: true,
    },
    {
        title: 'Data Access',
        description: 'Researcher guide, fair usage policy, and guidance on responsible data use',
        link: '/data-access/researchers-guide',
        Icon: AqDatabase01,
    },
];

function ProductCard({ title, description, link, Icon, disabled }: ProductItem) {
    const cardContent = (
        <>
            <div className={styles.cardContent}>
                <div className={styles.cardIcon}>
                    <Icon />
                </div>
                <div className={styles.cardText}>
                    <h3 className={styles.cardTitle}>{title}</h3>
                    <p className={styles.cardDescription}>{description}</p>
                </div>
            </div>
            {!disabled && (
                <div className={styles.cardArrow}>
                    <AqArrowRight />
                </div>
            )}
        </>
    );

    if (disabled) {
        return (
            <div className={`${styles.card} ${styles.disabledCard}`}>
                {cardContent}
            </div>
        );
    }

    return (
        <Link to={link} className={styles.card}>
            {cardContent}
        </Link>
    );
}

export default function ProductSection(): React.ReactNode {
    const activeProducts = ProductList.filter(p => !p.disabled);
    const disabledProducts = ProductList.filter(p => p.disabled);

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {activeProducts.map((props, idx) => (
                        <ProductCard key={idx} {...props} />
                    ))}
                </div>
                
                {disabledProducts.length > 0 && (
                    <div className={styles.comingSoonSection}>
                        <h2 className={styles.comingSoonTitle}>Coming Soon</h2>
                        <div className={styles.grid}>
                            {disabledProducts.map((props, idx) => (
                                <ProductCard key={idx} {...props} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
