import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Tokens } from '@authentication/types';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { GetCurrentUserId } from '../../common/decorator/get-current-user-id.decorator';
import { GetCurrentUser } from '../../common/decorator/get-current-user.decorator';
import { Public } from '../../common/decorator/public.decorator';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';
import { CookieService } from '../cookie/cookie.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @Public()
  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  public async signupLocal(
    @Body() signupDto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Tokens> {
    const tokens = await this.authService.signupLocal(signupDto);

    this.cookieService.setJwtTokenCookies(res, tokens);

    return tokens;
  }

  @Public()
  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  public async signinLocal(
    @Body() signinDto: SigninDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Tokens> {
    const tokens = await this.authService.signinLocal(signinDto);

    this.cookieService.setJwtTokenCookies(res, tokens);

    return tokens;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  public async logout(
    @GetCurrentUserId() userId: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<boolean> {
    console.log(userId);
    const boolean = await this.authService.logout(userId);

    this.cookieService.deleteJwtTokenCookies(res);

    return boolean;
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async rotateRefreshToken(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Tokens> {
    const tokens = await this.authService.rotateRefreshTokens(
      userId,
      refreshToken,
    );

    this.cookieService.setJwtTokenCookies(res, tokens);

    return tokens;
  }
}
