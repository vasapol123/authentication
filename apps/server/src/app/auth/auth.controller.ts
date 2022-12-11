import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtPayload, Tokens } from '@authentication/types';

import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { GetCurrentUserId } from '../../common/decorator/get-current-user-id.decorator';
import { GetCurrentUser } from '../../common/decorator/get-current-user.decorator';
import { Public } from '../../common/decorator/public.decorator';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('email/user')
  @HttpCode(HttpStatus.OK)
  public getCurrentUserInfo(@GetCurrentUser() user: JwtPayload): JwtPayload {
    return user;
  }

  @Public()
  @Post('email/signup')
  @HttpCode(HttpStatus.CREATED)
  public async signupLocal(@Body() signupDto: SignupDto): Promise<Tokens> {
    const tokens = await this.authService.signupLocal(signupDto);

    return tokens;
  }

  @Public()
  @Post('email/signin')
  @HttpCode(HttpStatus.OK)
  public async signinLocal(@Body() signinDto: SigninDto): Promise<Tokens> {
    const tokens = await this.authService.signinLocal(signinDto);

    return tokens;
  }

  @Post('email/logout')
  @HttpCode(HttpStatus.OK)
  public async logout(@GetCurrentUserId() userId: number): Promise<boolean> {
    console.log(userId);
    const boolean = await this.authService.logout(userId);

    return boolean;
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async rotateRefreshToken(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    const tokens = await this.authService.rotateRefreshTokens(
      userId,
      refreshToken,
    );

    return tokens;
  }
}
