import React from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

function useAuth(shouldRedirect: boolean) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isAuth, setIsAuth] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      signOut({ callbackUrl: '/signin', redirect: shouldRedirect });
    }

    if (session === null) {
      if (router.route !== '/signin') {
        router.replace('/signin');
      }
      setIsAuth(false);
    } else if (session !== undefined) {
      if (router.route === '/signin') {
        router.replace('/');
      }
      setIsAuth(true);
    }
  }, [session, router, shouldRedirect]);

  return isAuth;
}

export default useAuth;
