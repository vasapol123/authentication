import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';

import { Public } from '../../../common/decorator/public.decorator';
import { GoogleOauthService } from './google-oauth.service';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { UserProfile } from './types/user-profile.type';

@Controller('auth/google')
export class GoogleOauthController {
  constructor(private readonly googleOauthService: GoogleOauthService) {}

  @Get('/')
  @Public()
  @UseGuards(GoogleOauthGuard)
  public async googleAuth(@Req() _req: Request) {
    // Guard redirects
  }

  @Get('redirect')
  @Public()
  @UseGuards(GoogleOauthGuard)
  public async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    await this.googleOauthService.signinGoogle(req.user as UserProfile);
    return res.redirect('/api');
  }
}
