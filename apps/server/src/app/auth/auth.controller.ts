import {
  Controller,
  Param,
  Body,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtPayload, AuthTokens, sendMailPayload } from '@authentication/types';

import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { GetCurrentUserId } from '../../common/decorator/get-current-user-id.decorator';
import { GetCurrentUser } from '../../common/decorator/get-current-user.decorator';
import { Public } from '../../common/decorator/public.decorator';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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
  public async signupLocal(@Body() signupDto: SignupDto): Promise<AuthTokens> {
    const tokens = await this.authService.signupLocal(signupDto);

    return tokens;
  }

  @Public()
  @Post('email/signin')
  @HttpCode(HttpStatus.OK)
  public async signinLocal(@Body() signinDto: SigninDto): Promise<AuthTokens> {
    const tokens = await this.authService.signinLocal(signinDto);

    return tokens;
  }

  @Post('email/logout')
  @HttpCode(HttpStatus.OK)
  public async logout(@GetCurrentUserId() userId: number): Promise<boolean> {
    const boolean = await this.authService.logout(userId);

    return boolean;
  }

  @Public()
  @Post('email/forgot-password')
  @HttpCode(HttpStatus.OK)
  public async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<void> {
    await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Get('email/reset-password/:id/:token')
  @HttpCode(HttpStatus.OK)
  public extractSendMailPayload(
    @Param() params: Record<string, string>,
  ): Promise<sendMailPayload> {
    const { id, token } = params;

    return this.authService.extractSendMailPayload(Number(id), token);
  }

  @Public()
  @Post('email/reset-password/:id/:token')
  @HttpCode(HttpStatus.OK)
  public async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Param() params: Record<string, string>,
  ): Promise<void> {
    const { id, token } = params;

    await this.authService.resetPassword(Number(id), token, resetPasswordDto);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async rotateRefreshToken(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<AuthTokens> {
    const tokens = await this.authService.rotateRefreshTokens(
      userId,
      refreshToken,
    );

    return tokens;
  }
}
