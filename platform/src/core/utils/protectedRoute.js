import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function withAuth(Component) {
    return () => {
        const router = useRouter();
        const userCredentials = useSelector((state) => state.login);

        useEffect(() => {
            if (!userCredentials.success) {
                router.push('/');
            }
        }, [userCredentials]);

        return <Component />;
    };
}
