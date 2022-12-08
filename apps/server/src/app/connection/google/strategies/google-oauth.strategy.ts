import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserProfile } from '@authentication/types';
import { Strategy } from 'passport-custom';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
  static clientId: string;

  constructor(readonly config: ConfigService) {
    super();
    GoogleOauthStrategy.clientId = config.get<string>('GOOGLE_OAUTH_CLIENT_ID');
  }

  public async validate(req: Request): Promise<UserProfile> | null {
    try {
      if (
        req.headers &&
        'id_token' in req.headers &&
        req.headers.id_token.length > 0
      ) {
        const client = new OAuth2Client(GoogleOauthStrategy.clientId);
        const payload: TokenPayload = await client
          .verifyIdToken({
            idToken: req.headers.id_token as string,
            audience: GoogleOauthStrategy.clientId,
          })
          .then((payload) => {
            return payload.getPayload();
          });

        const user: UserProfile = {
          provider: 'google',
          providerId: payload.sub,
          email: payload.email,
          displayName: payload.name,
        };

        return user;
      }
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
