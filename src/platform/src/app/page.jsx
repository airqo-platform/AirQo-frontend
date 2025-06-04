import { redirect } from 'next/navigation';

const HomePage = () => {
  // Redirect to individual user Home page by default
  redirect('/user/Home');
};

export default HomePage;
