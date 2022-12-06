import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';

import { JwtPayload } from '@authentication/types';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        AccessTokenStrategy.extractJwtFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  private static extractJwtFromCookie(req: Request): string | null {
    if (
      req.cookies &&
      'JWT_ACCESS_TOKEN' in req.cookies &&
      req.cookies.JWT_ACCESS_TOKEN.length > 0
    ) {
      return req.cookies.JWT_ACCESS_TOKEN;
    }

    return null;
  }

  public validate(payload: JwtPayload) {
    return payload;
  }
}
