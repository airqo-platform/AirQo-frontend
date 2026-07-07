import MainLayout from '@/components/layout/MainLayout';
import ForumHero from '@/features/clean-air-forum/components/ForumHero';
import ForumEventsPage from '@/features/clean-air-forum/ForumEventsPage';
import {
  generateMetadata as createMetadata,
  generateViewport,
} from '@/lib/metadata';
// Generate metadata for SEO
export const metadata = createMetadata({
  title: "Africa Clean Air Forum | Africa's Premier Air Quality Convening",
  description:
    "Join Africa's annual convening for policymakers, air quality experts, industry leaders, academics, and civil society organizations. Fostering knowledge sharing and cross-border partnerships to address air pollution in African cities.",
  keywords:
    'Africa Clean Air Forum, air quality Africa, environmental conference, clean air advocacy, African cities pollution, air quality experts',
  url: '/africa-clean-air-forum',
});

export const viewport = generateViewport();

const page = () => {
  return (
    <MainLayout topFullWidth={<ForumHero />}>
      <ForumEventsPage skipHero />
    </MainLayout>
  );
};

export default page;
