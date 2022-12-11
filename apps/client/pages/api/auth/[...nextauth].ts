/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload, Signin, Tokens } from '@authentication/types';
import { AxiosResponse } from 'axios';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { setCookie } from 'nookies';

import axios from '../../../axios.config';

async function refreshAccessToken(
  tokenObject: Tokens & { user: JwtPayload },
): Promise<JWT> {
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

    console.log(tokenObject);

    return {
      ...tokenObject,
      jwtAccessToken: tokensResponse.data.jwtAccessToken,
      jwtAccessTokenExpiry: Date.now() + 15 * 60 * 1000,
      jwtRefreshToken: tokensResponse.data.jwtRefreshToken,
    };
  } catch (e) {
    return {
      ...tokenObject,
      error: 'RefreshAccessTokenError',
    };
  }
}

const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  }),
  CredentialsProvider({
    name: 'Credentials',
    credentials: {},
    authorize: async (credentials: Signin) => {
      try {
        const tokensResponse: AxiosResponse = await axios.post(
          '/api/auth/email/signin',
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

export const nextAuthOptions = (
  req: NextApiRequest,
  res: NextApiResponse,
): NextAuthOptions => {
  let googleOauthTokens: Tokens | undefined;

  return {
    providers,
    callbacks: {
      async signIn({ account }): Promise<boolean> {
        if (account.provider === 'google') {
          setCookie({ res }, 'GOOGLE_ID_TOKEN', account.id_token, {
            maxAge: 60 * 60,
            sameSite: 'strict',
            path: '/',
          });

          try {
            const res = await axios.post(
              '/api/auth/google/signin',
              {},
              {
                headers: {
                  id_token: account.id_token,
                },
              },
            );
            googleOauthTokens = res.data;
          } catch (e) {
            return false;
          }
        }
        return true;
      },
      async jwt({ token, user }): Promise<JWT> {
        if (user) {
          const userResponse: AxiosResponse<JwtPayload> = await axios.get(
            '/api/auth/email/user',
            {
              headers: {
                Authorization: `bearer ${
                  user.jwtAccessToken || googleOauthTokens.jwtAccessToken
                }`,
              },
            },
          );

          token.jwtAccessToken =
            user.jwtAccessToken || googleOauthTokens.jwtAccessToken;
          token.jwtAccessTokenExpiry = Date.now() + 15 * 60 * 1000;
          token.jwtRefreshToken =
            user.jwtRefreshToken || googleOauthTokens.jwtRefreshToken;
          token.user = userResponse.data;
        }

        const shouldRefreshTime = Math.round(
          token.jwtAccessTokenExpiry - 3 * 60 * 1000 - Date.now(),
        );

        if (shouldRefreshTime > 0) {
          return Promise.resolve(token);
        }

        const result = refreshAccessToken(token);
        return Promise.resolve(result);
      },
      async session({ session, token }) {
        session.jwtAccessToken = token.jwtAccessToken;
        session.jwtAccessTokenExpiry = token.jwtAccessTokenExpiry;
        session.user = token.user;
        session.error = token.error;

        return Promise.resolve(session);
      },
    },
    pages: {
      signIn: '/signin',
      error: '/connection',
      newUser: undefined,
    },
    secret: process.env.NEXTAUTH_SECRET,
  };
};

const AuthHandler: NextApiHandler = (req, res) =>
  NextAuth(req, res, nextAuthOptions(req, res));
export default AuthHandler;
