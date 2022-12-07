/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signin, Tokens } from '@authentication/types';
import { AxiosResponse } from 'axios';
import { NextApiHandler } from 'next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

import axios from '../../../axios.config';

async function refreshAccessToken(tokenObject: Tokens): Promise<JWT> {
  try {
    const tokensResponse: AxiosResponse<Tokens> = await axios.post(
      '/api/auth/refresh',
      {},
      {
        headers: {
          Authorization: `Bearer ${tokenObject.jwtRefreshToken}`,
        },
      },
    );

    console.log(tokensResponse);

    return {
      ...tokenObject,
      jwtAccessToken: tokensResponse.data.jwtAccessToken,
      jwtAccessTokenExpiry: Date.now() + 15 * 60 * 1000,
      jwtRefreshToken: tokensResponse.data.jwtRefreshToken,
    };
  } catch (error) {
    return {
      ...tokenObject,
      error: 'RefreshAccessTokenError',
    };
  }
}

const providers = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {},
    authorize: async (credentials: Signin) => {
      try {
        const tokensResponse: AxiosResponse = await axios.post(
          '/api/auth/local/signin',
          {
            email: credentials.email,
            password: credentials.password,
          },
          { withCredentials: true },
        );

        if (tokensResponse.data.jwtAccessToken) {
          return tokensResponse.data;
        }

        return null;
      } catch (e) {
        throw new Error('Error');
      }
    },
  }),
];

const callbacks: NextAuthOptions['callbacks'] = {
  async jwt({ token, user }): Promise<JWT> {
    if (user) {
      token.jwtAccessToken = user.jwtAccessToken;
      token.jwtAccessTokenExpiry = Date.now() + 15 * 60 * 1000;
      token.jwtRefreshToken = user.jwtRefreshToken;
    }

    const shouldRefreshTime = Math.round(
      token.jwtAccessTokenExpiry - 3 * 60 * 1000 - Date.now(),
    );

    console.log(shouldRefreshTime);

    if (shouldRefreshTime > 0) {
      return Promise.resolve(token);
    }

    const result = refreshAccessToken(token);
    return Promise.resolve(result);
  },
  async session({ session, token }) {
    session.jwtAccessToken = token.jwtAccessToken;
    session.jwtAccessTokenExpiry = token.jwtAccessTokenExpiry;
    session.error = token.error;

    return Promise.resolve(session);
  },
};

export const options: NextAuthOptions = {
  providers,
  callbacks,
  pages: {
    signIn: '/signin',
    newUser: undefined,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const AuthHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);
export default AuthHandler;
