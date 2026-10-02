'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useHomeStart } from '@/shared/hooks/useHomeStart';
import { ProductTour, type ProductTourStep } from './ProductTour';

/** Tour content per `homeStart` value; pathnames must match OUTCOME_ACTIONS. */
export const GUIDES: Record<
  string,
  { pathname: string; title: string; steps: ProductTourStep[] }
> = {
  'compare-places': {
    pathname: '/user/air-quality/analytics',
    title: 'Compare places',
    steps: [
      {
        target: '[data-tour="analytics-views"]',
        title: 'Choose your view',
        description:
          'Comparison puts locations side by side. You can switch back to trend charts here at any time.',
      },
      {
        target: '[data-tour="comparison-picker"]',
        title: 'Pick places to compare',
        description:
          'Select locations in this table. Their latest readings will appear together below, and you can save the selection.',
      },
    ],
  },
  'analyze-trends': {
    pathname: '/user/air-quality/analytics',
    title: 'Analyze trends',
    steps: [
      {
        target: '[data-tour="analytics-views"]',
        title: 'Start with trends',
        description:
          'Trends is where you build charts across locations and time periods.',
      },
      {
        target: '[data-tour="trends-content"]',
        title: 'Create or revisit a chart',
        description:
          'Choose a pollutant, location, and period. Saved charts will be ready for you on your next visit.',
      },
    ],
  },
  'explore-location': {
    pathname: '/user/map',
    title: 'Explore a location',
    steps: [
      {
        target: '[data-tour="map-sidebar"]',
        title: 'Find a place',
        description:
          'Search or browse locations here, then select one to open its readings and details.',
      },
      {
        target: '[data-tour="map-canvas"]',
        title: 'Explore on the map',
        description:
          'Select a marker to inspect conditions nearby. Save locations you want to keep tabs on.',
      },
    ],
  },
  'visualize-data': {
    pathname: '/user/data-visualizer',
    title: 'Visualize your data',
    steps: [
      {
        target: '[data-tour="visualizer-upload"]',
        title: 'Bring your own data',
        description:
          'Upload a CSV or spreadsheet here. Nexus will help you check the columns before charting.',
      },
      {
        target: '[data-tour="visualizer-workspace"]',
        title: 'Build a visual',
        description:
          'Once your file is ready, choose a chart or map. Your draft can be resumed later.',
      },
    ],
  },
  'export-data': {
    pathname: '/user/data-export',
    title: 'Export data',
    steps: [
      {
        target: '[data-tour="export-config"]',
        title: 'Set up your export',
        description:
          'Choose the period, frequency, pollutants, and file format in these controls.',
      },
      {
        target: '[data-tour="export-locations"]',
        title: 'Choose locations',
        description:
          'Select places in this table, then preview the rows before downloading.',
      },
    ],
  },
  'view-rankings': {
    pathname: '/user/air-quality/rankings',
    title: 'Explore rankings',
    steps: [
      {
        target: '[data-tour="rankings-controls"]',
        title: 'Choose a comparison',
        description:
          'Switch between cities and countries, and adjust the period you want to examine.',
      },
      {
        target: '[data-tour="rankings-content"]',
        title: 'Read the ranking',
        description:
          'Open a place from the results to see more detail, or explore how its ranking changed over time.',
      },
    ],
  },
};

export function HomeShortcutGuide() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const homeStart = useHomeStart();
  const guide = GUIDES[homeStart ?? ''];

  if (!guide || guide.pathname !== pathname) return null;

  const close = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('homeStart');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return (
    <ProductTour steps={guide.steps} title={guide.title} onClose={close} />
  );
}
