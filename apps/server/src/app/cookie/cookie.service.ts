import { Tokens } from '@authentication/types';
import { Injectable } from '@nestjs/common';
import { Response, CookieOptions } from 'express';

@Injectable()
export class CookieService {
  public setCookie<T = string>(
    res: Response,
    key: string,
    value: T,
    options?: CookieOptions,
  ) {
    res.cookie(key, value, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV !== 'development',
      ...options,
    });
  }

  public setJwtTokenCookies(res: Response, tokens: Tokens) {
    this.setCookie(
      res,
      'JWT_ACCESS_TOKEN',
      tokens.jwtAccessToken,
      { maxAge: 15 * 60 * 1000 }, // 15m
    );
    this.setCookie(
      res,
      'JWT_REFRESH_TOKEN',
      tokens.jwtRefreshToken,
      { maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7d
    );
  }

  public deleteJwtTokenCookies(res: Response) {
    res.clearCookie('JWT_ACCESS_TOKEN', { path: '/' });
    res.clearCookie('JWT_REFRESH_TOKEN', { path: '/' });
  }
}
