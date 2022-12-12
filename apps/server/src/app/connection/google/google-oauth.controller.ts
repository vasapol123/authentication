import {
  Body,
  Controller,
  Req,
  Post,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthTokens, UserProfile } from '@authentication/types';

import { Public } from '../../../common/decorator/public.decorator';
import { GoogleOauthService } from './google-oauth.service';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { SigninDto } from '../../auth/dto/signin.dto';
import { HttpStatus } from '@nestjs/common/enums';

@Controller('auth/google')
export class GoogleOauthController {
  constructor(private readonly googleOauthService: GoogleOauthService) {}

  @Post('signin')
  @Public()
  @UseGuards(GoogleOauthGuard)
  public googleAuthSignin(@Req() req: Request): Promise<AuthTokens> {
    return this.googleOauthService.signinGoogle(req.user as UserProfile);
  }

  @Post('connect')
  @Public()
  @UseGuards(GoogleOauthGuard)
  @HttpCode(HttpStatus.CREATED)
  public googleAuthConnect(
    @Req() req: Request,
    @Body() connectionDto: SigninDto,
  ) {
    return this.googleOauthService.connectLocal(
      req.user as UserProfile,
      connectionDto,
    );
  }
}
