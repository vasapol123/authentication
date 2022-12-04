import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

import { UserProfile } from '../types/user-profile.type';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_OAUTH_CLIENT_ID'),
      clientSecret: config.get<string>('GOOGLE_OAUTH_CLIENT_SECRET'),
      callbackURL: config.get<string>('GOOGLE_OAUTH_REDIRECT_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { id, emails, provider, displayName } = profile;
    const user: UserProfile = {
      provider,
      providerId: id,
      email: emails[0].value,
      displayName,
    };
    done(null, user);
  }
}
