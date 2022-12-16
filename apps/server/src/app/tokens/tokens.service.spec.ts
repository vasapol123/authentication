import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';

import { createRandomUser } from '../../test/unit/fixtures/user.fixture';
import { PrismaService } from '../prisma/prisma.service';
import { TokensService } from './tokens.service';
import { AppModule } from '../app.module';

describe('TokensService', () => {
  let service: TokensService;
  const fakeUser = createRandomUser();

  const mockPrismaService = {
    user: {
      update: jest.fn(),
      findUnique: jest.fn().mockResolvedValue(fakeUser),
    },
  };

  beforeAll(async () => {
    jest
      .spyOn(argon2, 'verify')
      .mockImplementation(
        (
          hashedRefreshToken: string,
          refreshToken: string,
        ): Promise<boolean> => {
          return Promise.resolve(hashedRefreshToken === refreshToken);
        },
      );
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    service = module.get<TokensService>(TokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTokens', () => {
    it('should create tokens and return those', async () => {
      await expect(service.getTokens(Date.now(), user.email)).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });
    });
  });

  describe('updateRefreshToken', () => {
    it('should call the update method', async () => {
      await service.updateRefreshToken(Date.now(), 'fakeRefreshToken');
      expect(mockPrismaService.user.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('rotateRefreshToken', () => {
    it('should successfully retotate refresh token', async () => {
      await expect(
        service.rotateRefreshTokens(Date.now(), 'fakeRefreshToken'),
      ).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.update).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when fail verifying refresh token', async () => {
      await expect(
        service.rotateRefreshTokens(Date.now(), 'wrongRefreshToken'),
      ).rejects.toThrowError(ForbiddenException);
    });
  });
});
