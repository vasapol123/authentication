import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from '@authentication/types';
import * as argon2 from 'argon2';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TokensService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  public async rotateRefreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<Tokens> {
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
  ): Promise<Tokens> {
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
}
