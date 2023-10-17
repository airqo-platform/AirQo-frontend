import Layout from '@/components/Layout';
import HeaderNav from '@/components/Layout/header';
import illustration from '@/icons/Home/illustration.jpg';
import Image from 'next/image';
import CollocationOverview from '@/pages/analytics/collocation/overview';
import withAuth from '@/core/utils/protectedRoute';

const Home = () => <CollocationOverview />;

export default withAuth(Home);
