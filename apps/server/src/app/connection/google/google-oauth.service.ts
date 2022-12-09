import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Tokens, UserProfile } from '@authentication/types';
import * as argon2 from 'argon2';

import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import { TokensService } from '../../tokens/tokens.service';
import { SigninDto } from '../../auth/dto/signin.dto';

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

  public async connectLocal(
    userProfile: UserProfile,
    connectionDto: SigninDto,
  ) {
    const user = await this.usersService.findUserByEmail(connectionDto.email);
    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    const passwordMatches = await argon2.verify(
      user.hashedPassword,
      connectionDto.password,
    );
    if (!passwordMatches) {
      throw new BadRequestException('Password invalid');
    }

    await this.prisma.externalAuths.create({
      data: {
        provider: userProfile.provider,
        providerId: userProfile.providerId,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }
}
