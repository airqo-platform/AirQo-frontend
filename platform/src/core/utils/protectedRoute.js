import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

export default function withAuth(Component) {
  return () => {
    const router = useRouter();
    const userCredentials = useSelector((state) => state.login);
    useEffect(() => {
      if (!userCredentials.success) {
        router.push('/account/login');
      }
    }, [userCredentials]);

    return userCredentials.success && <Component />;
  };
}
