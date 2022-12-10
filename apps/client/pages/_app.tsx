import React from 'react';
import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import './styles.scss';
import RefreshTokenHandler from '../components/refreshTokenHandler';

function CustomApp({ Component, pageProps }: AppProps) {
  const [interval, setInterval] = React.useState(0);

  return (
    <React.Fragment>
      <SessionProvider session={pageProps.session} refetchInterval={interval}>
        <Component {...pageProps} />
        <RefreshTokenHandler setInterval={setInterval} />
      </SessionProvider>
    </React.Fragment>
  );
}

export default CustomApp;
