import CollocationOverview from '@/pages/collocation/overview';
import withAuth from '@/core/utils/protectedRoute';

const Home = () => <CollocationOverview />;

export default withAuth(Home);
