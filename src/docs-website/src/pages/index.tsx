import type { ReactNode } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import ProductSection from '@site/src/components/ProductSection';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <div className={styles.header}>
      <Heading as="h1" className={styles.title}>
        AirQo Digital Product Docs
      </Heading>
      <p className={styles.subtitle}>
        Documentation for AirQo&apos;s open air quality data digital products
      </p>
    </div>
  );
}

export default function Home(): ReactNode {
  // const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Product Docs`}
      description="Documentation for AirQo's open air quality data digital products">
      <main className={styles.mainContainer}>
        <div className={styles.contentWrapper}>
          <HomepageHeader />
          <ProductSection />
        </div>
      </main>
    </Layout>
  );
}
