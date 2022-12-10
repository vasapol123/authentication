import React from 'react';
import { signIn } from 'next-auth/react';
import styles from './navbar.module.scss';
import { useRouter } from 'next/router';

function Navbar() {
  const router = useRouter();

  return (
    <main className={styles.container}>
      <button onClick={() => signIn()} className={styles.signin}>
        Sign In
      </button>
      <button onClick={() => router.push('/signup')} className={styles.signup}>
        Sign Up
      </button>
    </main>
  );
}

export default Navbar;
