import { Injectable, ForbiddenException } from '@nestjs/common';
import { Tokens } from '@authentication/types';

import { PrismaService } from '../../prisma/prisma.service';
import { UserProfile } from './types/user-profile.type';
import { UsersService } from '../../users/users.service';
import { TokensService } from '../../tokens/tokens.service';

@Injectable()
export class GoogleOauthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
  ) {}

  public async signinGoogle(userProfile: UserProfile): Promise<Tokens> {
    const externalAuth = await this.prisma.externalAuths.findUnique({
      where: {
        providerId: userProfile.providerId,
      },
    });
    if (!externalAuth) {
      throw new ForbiddenException(
        'This Google account does not connect to any account yet!',
      );
    }

    const user = await this.usersService.findUserById(externalAuth.userId);

    const tokens = await this.tokensService.getTokens(user.id, user.email);
    await this.tokensService.updateRefreshToken(
      user.id,
      tokens.jwtRefreshToken,
    );

    return tokens;
  }
}
