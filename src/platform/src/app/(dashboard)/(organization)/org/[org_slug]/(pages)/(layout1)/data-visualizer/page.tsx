import type { Metadata } from 'next';
import DataVisualizerPage from '@/modules/data-visualizer/DataVisualizerPage';

export const metadata: Metadata = {
  title: 'Upload & Visualize Air Quality Data',
};

const Page = () => {
  return <DataVisualizerPage />;
};

export default Page;
