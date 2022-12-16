import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SendMailPayload } from '@authentication/types';
import { faker } from '@faker-js/faker';
import * as argon2 from 'argon2';

import { createRandomUser } from '../../test/unit/fixtures/user.fixture';
import { PrismaService } from '../prisma/prisma.service';
import { TokensService } from './tokens.service';
import { AppModule } from '../app.module';
import { JwtService } from '@nestjs/jwt';

describe('TokensService', () => {
  let service: TokensService;
  const fakeUser = createRandomUser();

  const payload: SendMailPayload = {
    toEmail: fakeUser.email,
    userId: fakeUser.id,
    displayName: fakeUser.displayName,
    forgotPasswordToken: expect.anything(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn().mockResolvedValue(payload),
    signAsync: jest.fn().mockResolvedValue(faker.datatype.uuid()),
  };

  const mockPrismaService = {
    user: {
      update: jest.fn(),
      findUnique: jest.fn().mockResolvedValue(fakeUser),
    },
  };

  beforeAll(async () => {
    jest
      .spyOn(argon2, 'verify')
      .mockImplementation(() => Promise.resolve(true));
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    service = module.get<TokensService>(TokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyToken', () => {
    const args = {
      token: faker.datatype.uuid(),
      secret: faker.datatype.uuid(),
    };

    it('should throw an UnauthorizedException error if token is invalid', async () => {
      jest
        .spyOn(mockJwtService, 'verifyAsync')
        .mockRejectedValueOnce(new Error('error message'));

      await expect(
        service.verifyToken(args.token, args.secret),
      ).rejects.toThrowError(new UnauthorizedException('Error Message'));
    });

    it('should return payload if token is valid', async () => {
      await expect(
        service.verifyToken(args.token, args.secret),
      ).resolves.toEqual(payload);
    });
  });

  describe('rotateRefreshToken', () => {
    const args = {
      userId: fakeUser.id,
      refreshToken: faker.datatype.uuid(),
    };

    it('should throw an error if user does not exist', async () => {
      jest
        .spyOn(mockPrismaService.user, 'findUnique')
        .mockResolvedValueOnce(undefined);

      await expect(
        service.rotateRefreshTokens(args.userId, args.refreshToken),
      ).rejects.toThrowError(new ForbiddenException('Access Denied'));
    });

    it('should throw an error if fail verifying refresh token', async () => {
      jest.spyOn(argon2, 'verify').mockResolvedValueOnce(false);

      await expect(
        service.rotateRefreshTokens(args.userId, args.refreshToken),
      ).rejects.toThrowError(new ForbiddenException('Access Denied'));
    });

    it('should call PrismaService with expect params', async () => {
      await service.rotateRefreshTokens(args.userId, args.refreshToken);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: args.userId,
        },
      });
    });

    it('should call TokensService with expect params', async () => {
      const getAuthTokensSpy = jest
        .spyOn(service, 'getAuthTokens')
        .mockResolvedValueOnce({
          jwtAccessToken: faker.datatype.uuid(),
          jwtRefreshToken: faker.datatype.uuid(),
        });
      const updateRefreshTokenSpy = jest
        .spyOn(service, 'updateRefreshToken')
        .mockResolvedValueOnce(null);

      await service.rotateRefreshTokens(args.userId, args.refreshToken);

      expect(getAuthTokensSpy).toHaveBeenCalledWith(
        fakeUser.id,
        fakeUser.email,
        fakeUser.displayName,
      );
      expect(updateRefreshTokenSpy).toHaveBeenCalledWith(
        fakeUser.id,
        expect.any(String),
      );
    });

    it('should return tokens', async () => {
      await expect(
        service.rotateRefreshTokens(args.userId, args.refreshToken),
      ).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });
    });
  });

  describe('updateRefreshToken', () => {
    const args = {
      userId: fakeUser.id,
      refreshToken: faker.datatype.uuid(),
    };

    it('should call PrismaService with expect params', async () => {
      const hashedRefreshToken = fakeUser.hashedRefreshToken;

      jest.spyOn(argon2, 'hash').mockResolvedValueOnce(hashedRefreshToken);

      await service.updateRefreshToken(args.userId, args.refreshToken);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: {
          id: args.userId,
        },
        data: {
          hashedRefreshToken,
        },
      });
    });
  });

  describe('getAuthTokens', () => {
    const args = {
      userId: fakeUser.id,
      email: fakeUser.email,
      displayName: fakeUser.displayName,
    };

    it('should call JwtService with expected params', async () => {
      const jwtPayload = {
        sub: args.userId,
        email: args.email,
        displayName: args.displayName,
      };

      await service.getAuthTokens(
        fakeUser.id,
        fakeUser.email,
        fakeUser.displayName,
      );

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(jwtPayload, {
        secret: expect.any(String),
        expiresIn: expect.any(String),
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should create tokens and return those', async () => {
      await expect(
        service.getAuthTokens(
          fakeUser.id,
          fakeUser.email,
          fakeUser.displayName,
        ),
      ).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });
    });
  });

  describe('getForgotPasswordToken', () => {
    const args = {
      userId: fakeUser.id,
      email: fakeUser.email,
      hashedPassword: fakeUser.hashedPassword,
    };

    it('should call JwtService with expected params', async () => {
      const payload = {
        id: args.userId,
        email: args.email,
      };

      await service.getForgotPasswordToken(
        args.userId,
        args.email,
        args.hashedPassword,
      );

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload, {
        secret: expect.any(String),
        expiresIn: expect.any(String),
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(1);
    });

    it('should return a token', async () => {
      await expect(
        service.getForgotPasswordToken(
          args.userId,
          args.email,
          args.hashedPassword,
        ),
      ).resolves.toEqual(expect.any(String));
    });
  });
});
