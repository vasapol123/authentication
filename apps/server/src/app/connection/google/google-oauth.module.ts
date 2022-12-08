import { Module } from '@nestjs/common';

import { TokensModule } from '../../tokens/tokens.module';
import { UsersModule } from '../../users/users.module';
import { GoogleOauthController } from './google-oauth.controller';
import { GoogleOauthService } from './google-oauth.service';
import { GoogleOauthStrategy } from './strategies/google-oauth.strategy';

@Module({
  imports: [UsersModule, TokensModule],
  controllers: [GoogleOauthController],
  providers: [GoogleOauthService, GoogleOauthStrategy],
})
export class GoogleOauthModule {}
