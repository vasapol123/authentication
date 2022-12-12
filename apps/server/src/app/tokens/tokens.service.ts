import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  AuthTokens,
  ForgotPasswordToken,
  sendMailPayload,
} from '@authentication/types';
import * as argon2 from 'argon2';

import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common/exceptions';

@Injectable()
export class TokensService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  public async verifyToken(
    token: string,
    secret: string,
  ): Promise<sendMailPayload> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      return payload;
    } catch (e) {
      throw new UnauthorizedException(
        // Capitalize the first letter of each error message word
        e.message.replace(/(^\w{1})|(\s+\w{1})/g, (letter: string) =>
          letter.toUpperCase(),
        ),
      );
    }
  }

  public async rotateRefreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const verifiedRefreshToken = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken,
    );
    if (!verifiedRefreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email, user.displayName);
    await this.updateRefreshToken(user.id, tokens.jwtRefreshToken);

    return tokens;
  }

  public async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken,
      },
    });
  }

  public async getTokens(
    userId: number,
    email: string,
    displayName: string,
  ): Promise<AuthTokens> {
    const jwtPayload = {
      sub: userId,
      email,
      displayName,
    };

    const [jwtAccessToken, jwtRefreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { jwtAccessToken, jwtRefreshToken };
  }

  public async getForgotPasswordToken(
    userId: number,
    email: string,
    hashedPassword: string,
  ): Promise<ForgotPasswordToken> {
    const payload = {
      id: userId,
      email,
    };

    const forgotPasswordToken = await this.jwtService.signAsync(payload, {
      secret:
        this.config.get<string>('JWT_FORGOT_PASSWORD_SECRET') + hashedPassword,
      expiresIn: '15m',
    });

    return forgotPasswordToken;
  }
}
