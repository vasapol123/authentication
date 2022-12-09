import { Injectable, BadRequestException } from '@nestjs/common';
import { Tokens } from '@authentication/types';
import * as argon2 from 'argon2';

import { TokensService } from '../tokens/tokens.service';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
  ) {}

  public async signupLocal(signupDto: SignupDto): Promise<Tokens> {
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

  public async signinLocal(signinDto: SigninDto): Promise<Tokens> {
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
    const user = await this.usersService.updateUser({
      id: userId,
      hashedRefreshToken: null,
    });
    return !!user;
  }

  public async rotateRefreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<Tokens> {
    return this.tokensService.rotateRefreshTokens(userId, refreshToken);
  }
}
