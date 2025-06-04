import { redirect } from 'next/navigation';

const UserPage = () => {
  // Redirect to user Home page
  redirect('/user/Home');
};

export default UserPage;
