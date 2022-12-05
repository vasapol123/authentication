import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User, ExternalAuths } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { TokensService } from '../../tokens/tokens.service';
import { UsersService } from '../../users/users.service';
import { GoogleOauthService } from './google-oauth.service';
import { UserProfile } from './types/user-profile.type';

describe('GoogleOauthService', () => {
  let service: GoogleOauthService;

  const user: User = {
    id: Date.now(),
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'jonathan@example.com',
    displayName: 'Jonathan',
    hashedPassword: 'fakeHashedPassword',
    hashedRefreshToken: 'fakeRefreshToken',
  };

  const externalAuth: ExternalAuths = {
    id: Date.now(),
    createdAt: new Date(),
    updatedAt: new Date(),
    provider: 'google',
    providerId: 'google__providerId',
    userId: 1,
  };

  const mockTokensService = {
    getTokens: jest.fn().mockResolvedValue({
      jwtAccessToken: 'fakeJwtAccessToken',
      jwtRefreshToken: 'fakeJwtRefreshToken',
    }),
    updateRefreshToken: jest.fn(),
  };

  const mockUsersService = {
    findUserById: jest.fn().mockResolvedValue(user),
  };

  const mockPrismaService = {
    externalAuths: {
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signinGoogle', () => {
    const userProfile: UserProfile = {
      email: 'jonathan@example.com',
      displayName: 'Jonathan',
      provider: 'google',
      providerId: 'google__providerId',
    };

    it('should successfully signin', () => {
      expect(service.signinGoogle(userProfile)).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });
    });

    it('should throw an error if not connect account yet', () => {
      jest
        .spyOn(mockPrismaService.externalAuths, 'findUnique')
        .mockResolvedValueOnce(null);

      expect(service.signinGoogle(userProfile)).rejects.toThrowError(
        ForbiddenException,
      );
    });
  });
});
