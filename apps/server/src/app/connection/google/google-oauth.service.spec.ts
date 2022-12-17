import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ExternalAuths } from '@prisma/client';
import * as argon2 from 'argon2';

import { createRandomUser } from '../../../test/unit/fixtures/user.fixture';
import { createRandomExternalAuth } from '../../../test/unit/fixtures/external-auth.fixture';
import { PrismaService } from '../../prisma/prisma.service';
import { TokensService } from '../../tokens/tokens.service';
import { UsersService } from '../../users/users.service';
import { GoogleOauthService } from './google-oauth.service';
import { AuthTokens, UserProfile } from '@authentication/types';
import { faker } from '@faker-js/faker';
import { SigninDto } from '../../auth/dto/signin.dto';

jest.mock('argon2');

describe('GoogleOauthService', () => {
  let service: GoogleOauthService;
  const fakeUser = createRandomUser();
  const externalAuth: ExternalAuths = createRandomExternalAuth();
  const userProfile: UserProfile = {
    email: fakeUser.email,
    displayName: fakeUser.displayName,
    provider: externalAuth.provider,
    providerId: externalAuth.providerId,
  };

  const mockTokensService = {
    getAuthTokens: jest.fn<Promise<AuthTokens>, []>().mockResolvedValue({
      jwtAccessToken: faker.datatype.uuid(),
      jwtRefreshToken: faker.datatype.uuid(),
    }),
    updateRefreshToken: jest.fn(),
  };

  const mockUsersService = {
    findUserById: jest.fn().mockResolvedValue(fakeUser),
    findUserByEmail: jest.fn().mockResolvedValue(fakeUser),
  };

  const mockPrismaService = {
    externalAuths: {
      create: jest.fn().mockResolvedValue(externalAuth),
      findUnique: jest.fn().mockResolvedValue(externalAuth),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleOauthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: TokensService,
          useValue: mockTokensService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GoogleOauthService>(GoogleOauthService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signinGoogle', () => {
    it('should get tokens if user is signed in', async () => {
      await expect(service.signinGoogle(userProfile)).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });
    });

    it('should throw a ForbiddenException error if account is not connect yet', async () => {
      jest
        .spyOn(mockPrismaService.externalAuths, 'findUnique')
        .mockResolvedValueOnce(null);

      await expect(service.signinGoogle(userProfile)).rejects.toThrowError(
        new ForbiddenException(
          'This Google account does not connect to any account yet!',
        ),
      );
    });

    it('should call UsersService with expected params', async () => {
      await service.signinGoogle(userProfile);

      expect(mockUsersService.findUserById).toHaveBeenCalledWith(
        externalAuth.userId,
      );
    });

    it('should call TokensService with expected params', async () => {
      await service.signinGoogle(userProfile);

      expect(mockTokensService.getAuthTokens).toHaveBeenCalledWith(
        fakeUser.id,
        fakeUser.email,
        fakeUser.displayName,
      );
      expect(mockTokensService.updateRefreshToken).toHaveBeenCalledWith(
        fakeUser.id,
        expect.any(String),
      );
    });
  });

  describe('connectLocal', () => {
    jest.spyOn(argon2, 'verify').mockResolvedValue(true);

    const connectionDto: SigninDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    it('should throw a BadRequestException error if user does not exist', async () => {
      jest
        .spyOn(mockUsersService, 'findUserByEmail')
        .mockResolvedValueOnce(null);

      await expect(
        service.connectLocal(userProfile, connectionDto),
      ).rejects.toThrowError(new BadRequestException('User does not exist'));
    });

    it('should throw a BadRequestException error if password invalid', async () => {
      jest.spyOn(argon2, 'verify').mockResolvedValueOnce(false);

      await expect(
        service.connectLocal(userProfile, connectionDto),
      ).rejects.toThrowError(new BadRequestException('Password invalid'));
    });

    it('should call PrismaService create with expected params', async () => {
      await service.connectLocal(userProfile, connectionDto);

      expect(mockPrismaService.externalAuths.create).toHaveBeenCalledWith({
        data: {
          provider: userProfile.provider,
          providerId: userProfile.providerId,
          user: {
            connect: {
              id: fakeUser.id,
            },
          },
        },
      });
    });
  });
});
