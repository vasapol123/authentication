/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { Tokens } from '@authentication/types';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends Omit<Tokens, 'jwtRefreshToken'> {
    jwtAccessTokenExpiry?: number;
    error?: 'RefreshAccessTokenError';
  }

  interface User extends Tokens {}
}

declare module 'next-auth/jwt' {
  /**
   * Returned by the `jwt` callback and `getToken`, when using JWT sessions
   */
  interface JWT extends Tokens {
    jwtAccessTokenExpiry?: number;
    error?: 'RefreshAccessTokenError';
  }
}
