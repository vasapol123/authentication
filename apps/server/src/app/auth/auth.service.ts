import { Injectable, BadRequestException } from '@nestjs/common';
import {
  AuthTokens,
  ForgotPasswordToken,
  sendMailPayload,
} from '@authentication/types';
import * as argon2 from 'argon2';

import { TokensService } from '../tokens/tokens.service';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailsService } from '../mails/mails.service';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException } from '@nestjs/common/exceptions/forbidden.exception';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
    private readonly mailsService: MailsService,
  ) {}

  public async signupLocal(signupDto: SignupDto): Promise<AuthTokens> {
    const hashedPassword = await argon2.hash(signupDto.password);

    const user = await this.usersService.createUser({
      email: signupDto.email,
      displayName: signupDto.displayName,
      hashedPassword,
    });

    const tokens = await this.tokensService.getTokens(
      user.id,
      user.email,
      user.displayName,
    );
    await this.tokensService.updateRefreshToken(
      user.id,
      tokens.jwtRefreshToken,
    );

    return tokens;
  }

  public async signinLocal(signinDto: SigninDto): Promise<AuthTokens> {
    const user = await this.usersService.findUserByEmail(signinDto.email);
    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    const passwordMatches = await argon2.verify(
      user.hashedPassword,
      signinDto.password,
    );
    if (!passwordMatches) {
      throw new BadRequestException('Password invalid');
    }

    const tokens = await this.tokensService.getTokens(
      user.id,
      user.email,
      user.displayName,
    );
    await this.tokensService.updateRefreshToken(
      user.id,
      tokens.jwtRefreshToken,
    );

    return tokens;
  }

  public async logout(userId: number): Promise<boolean> {
    const user = await this.usersService.updateUser(userId, {
      hashedRefreshToken: null,
    });
    return !!user;
  }

  public async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<void> {
    const user = await this.usersService.findUserByEmail(
      forgotPasswordDto.email,
    );
    if (!user) {
      throw new BadRequestException(
        'User does not exist with the specified email',
      );
    }

    const token = await this.tokensService.getForgotPasswordToken(
      user.id,
      user.email,
      user.hashedPassword,
    );

    const payload: sendMailPayload = {
      toEmail: forgotPasswordDto.email,
      userId: user.id,
      displayName: user.displayName,
      forgotPasswordToken: token,
    };

    const mailerResponse = await this.mailsService.sendResetPasswordEmail(
      payload,
      {
        from: this.config.get<string>('DEFAULT_EMAIL_FROM'),
        subject: 'Reset Password',
      },
    );
    if (!mailerResponse) {
      throw new ForbiddenException('Send email error');
    }
    console.log('Sent');
  }

  public async extractSendMailPayload(
    userId: number,
    forgotPasswordToken: ForgotPasswordToken,
  ): Promise<sendMailPayload> {
    const user = await this.usersService.findUserById(userId);
    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    const secret =
      this.config.get<string>('JWT_FORGOT_PASSWORD_SECRET') +
      user.hashedPassword;

    const payload = await this.tokensService.verifyToken(
      forgotPasswordToken,
      secret,
    );

    return payload;
  }

  public async resetPassword(
    userId: number,
    forgotPasswordToken: ForgotPasswordToken,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    const user = await this.usersService.findUserById(userId);
    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    const secret =
      this.config.get<string>('JWT_FORGOT_PASSWORD_SECRET') +
      user.hashedPassword;
    await this.tokensService.verifyToken(forgotPasswordToken, secret);

    const hashedPassword = await argon2.hash(resetPasswordDto.newPassword);

    await this.usersService.updateUser(user.id, {
      hashedPassword,
    });
  }

  public async rotateRefreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<AuthTokens> {
    return this.tokensService.rotateRefreshTokens(userId, refreshToken);
  }
}
