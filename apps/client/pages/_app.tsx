import React from 'react';
import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import './styles.css';
import RefreshTokenHandler from '../components/refreshTokenHandler';

function CustomApp({ Component, pageProps }: AppProps) {
  const [interval, setInterval] = React.useState(0);

  return (
    <>
      <Head>
        <title>Welcome to client!</title>
      </Head>
      <SessionProvider session={pageProps.session} refetchInterval={interval}>
        <Component {...pageProps} />
        <RefreshTokenHandler setInterval={setInterval} />
      </SessionProvider>
    </>
  );
}

export default CustomApp;
