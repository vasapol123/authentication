import { useSession, signIn, signOut } from 'next-auth/react';
import { destroyCookie } from 'nookies';
import axios from '../../axios.config';

export default function LoginComponent() {
  const { data: session } = useSession();

  const onLogoutButtonClick = async () => {
    destroyCookie(null, 'GOOGLE_ID_TOKEN');

    await axios.post(
      '/api/auth/logout',
      {},
      {
        headers: {
          Authorization: `bearer ${session.jwtAccessToken}`,
        },
      },
    );
    signOut({
      callbackUrl: `${window.location.origin}`,
      redirect: false,
    });
  };

  if (session) {
    return (
      <>
        Signed in as {session.user.displayName} <br />
        <input type='button' value='Logout' onClick={onLogoutButtonClick} />
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}
