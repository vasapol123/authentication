import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import styles from './navbar.module.scss';
import { useRouter } from 'next/router';

import { destroyCookie } from 'nookies';
import axios from '../../axios.config';
import Profile from '../Profile';
import NavItem from './NavItem';
import ProfileDropdownMenu from '../Profile/DropdownMenu';
import Link from 'next/link';

function Navbar(): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();

  const onLogoutClick = async () => {
    destroyCookie(null, 'GOOGLE_ID_TOKEN');

    await axios.post(
      '/api/auth/email/logout',
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

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navbar__nav}>
        <NavItem
          styles={styles}
          item={
            <Link href='/' className={styles['nav-item__home']}>
              Authentication
            </Link>
          }
        />
        {session ? (
          <NavItem styles={styles} item={<Profile />}>
            <ProfileDropdownMenu
              onLogoutClick={onLogoutClick}
              session={session}
            />
          </NavItem>
        ) : (
          <React.Fragment>
            <button onClick={() => signIn()} className={styles.signin}>
              Sign In
            </button>
            <button
              onClick={() => router.push('/signup')}
              className={styles.signup}
            >
              Sign Up
            </button>
          </React.Fragment>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
