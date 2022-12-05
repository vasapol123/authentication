import { Test, TestingModule } from '@nestjs/testing';
import { JwtPayload } from '@authentication/types';
import { Tokens } from '@authentication/types';
import { User } from '@prisma/client';
import jwtDecode from 'jwt-decode';
import { omit } from 'lodash';

import { AppModule } from '../../../app.module';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthService } from '../../auth.service';
import { SigninDto } from '../../dto/signin.dto';
import { SignupDto } from '../../dto/signup.dto';

describe('Auth Flow', () => {
  let prisma: PrismaService;
  let service: AuthService;

  const signupDto: SignupDto = {
    email: 'jonathan@example.com',
    displayName: 'Jonathan',
    password: 'fakePassword',
  };

  const signinDto: SigninDto = omit(signupDto, ['displayName']);

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('signup', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should signup', async () => {
      const tokens = await service.signupLocal(signupDto);

      expect(tokens.jwtAccessToken).toBeTruthy();
      expect(tokens.jwtRefreshToken).toBeTruthy();
    });

    it('should throw on duplicate user signup', async () => {
      let tokens: Tokens | undefined;

      try {
        tokens = await service.signupLocal(signupDto);
      } catch (e) {
        expect(e.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });
  });

  describe('signin', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should throw if user does not exist', async () => {
      let tokens: Tokens | undefined;

      try {
        tokens = await service.signinLocal(signinDto);
      } catch (e) {
        expect(e.status).toBe(400);
      }

      expect(tokens).toBeUndefined();
    });

    it('should login a user', async () => {
      await service.signupLocal(signupDto);

      const tokens = await service.signinLocal(signinDto);

      expect(tokens.jwtAccessToken).toBeTruthy();
      expect(tokens.jwtRefreshToken).toBeTruthy();
    });

    it('should throw if password incorrect', async () => {
      let tokens: Tokens | undefined;

      try {
        tokens = await service.signinLocal({
          email: signinDto.email,
          password: signinDto.password.slice(0, -1),
        });
      } catch (e) {
        expect(e.status).toBe(400);
      }

      expect(tokens).toBeUndefined();
    });
  });

  describe('logout', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should pass if logout for non existing user', async () => {
      try {
        await service.logout(5);
      } catch (e) {
        expect(e.status).toBe(403);
      }
    });
  });

  it('should logout a user', async () => {
    await service.signupLocal(signupDto);

    let userFromDb: User | null;

    userFromDb = await prisma.user.findFirst({
      where: {
        email: signupDto.email,
      },
    });
    expect(userFromDb?.hashedRefreshToken).toBeTruthy();

    await service.logout(userFromDb.id);

    userFromDb = await prisma.user.findFirst({
      where: {
        email: signupDto.email,
      },
    });
    expect(userFromDb?.hashedRefreshToken).toBeFalsy();
  });

  describe('rotate refresh token', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should throw if user does not exist', async () => {
      let tokens: Tokens | undefined;

      try {
        tokens = await service.rotateRefreshTokens(1, '');
      } catch (e) {
        expect(e.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });

    it('should throw if user logged out', async () => {
      const _tokens = await service.signupLocal(signupDto);
      const refreshToken = _tokens.jwtRefreshToken;

      const decoded = jwtDecode<JwtPayload>(refreshToken);
      const userId = Number(decoded?.sub);

      await service.logout(userId);

      let tokens: Tokens | undefined;
      try {
        tokens = await service.rotateRefreshTokens(userId, refreshToken);
      } catch (e) {
        expect(e.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });

    it('should throw if refresh token incorrect', async () => {
      await prisma.cleanDatabase();

      const _tokens = await service.signupLocal(signupDto);
      const refreshToken = _tokens.jwtRefreshToken;

      const decoded = jwtDecode<JwtPayload>(refreshToken);
      const userId = Number(decoded?.sub);

      let tokens: Tokens | undefined;
      try {
        tokens = await service.rotateRefreshTokens(
          userId,
          refreshToken.slice(0, -1),
        );
      } catch (e) {
        expect(e.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });
  });

  it('should rotate refresh token', async () => {
    await prisma.cleanDatabase();

    const _tokens = await service.signupLocal(signupDto);
    const refreshToken = _tokens.jwtRefreshToken;
    const accessToken = _tokens.jwtAccessToken;

    const decoded = jwtDecode<JwtPayload>(refreshToken);
    const userId = Number(decoded?.sub);

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 2000);
    });

    const tokens = await service.rotateRefreshTokens(userId, refreshToken);
    expect(tokens).toBeDefined();

    expect(tokens.jwtAccessToken).not.toBe(accessToken);
    expect(tokens.jwtRefreshToken).not.toBe(refreshToken);
  });
});
