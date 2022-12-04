import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';

import { AuthService } from './auth.service';
import { TokensService } from '../tokens/tokens.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const user: User = {
    id: Date.now(),
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'jonathan@example.com',
    displayName: 'Jonathan',
    hashedPassword: 'fakeHashedPassword',
    hashedRefreshToken: 'fakeRefreshToken',
  };

  const mockTokensService = {
    getTokens: jest.fn().mockResolvedValue({
      jwtAccessToken: 'fakeJwtAccessToken',
      jwtRefreshToken: 'fakeJwtRefreshToken',
    }),
    updateRefreshToken: jest.fn(),
  };

  const mockUsersService = {
    createUser: jest.fn().mockImplementation((dto) => {
      return Promise.resolve({
        id: Date.now(),
        ...dto,
      });
    }),
    findUserByEmail: jest.fn().mockResolvedValue(user),
    updateUser: jest.fn().mockResolvedValue(user),
  };

  const mockPrismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        ConfigService,
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

    service = module.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signupLocal', () => {
    it('should successfully sign up a user', async () => {
      const signupDto: SignupDto = {
        email: 'william@example.com',
        displayName: 'William',
        password: 'fakeHashedPassword',
      };

      await expect(service.signupLocal(signupDto)).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });
    });
  });

  describe('signinLocal', () => {
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

    const signinDto: SigninDto = {
      email: user.email,
      password: 'fakeHashedPassword',
    };

    it('should successfully sign in a user', async () => {
      await expect(service.signinLocal(signinDto)).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });
    });

    it('should throw a BadRequestException error if user does not exist', async () => {
      jest
        .spyOn(mockUsersService, 'findUserByEmail')
        .mockResolvedValueOnce(null);

      await expect(service.signinLocal(signinDto)).rejects.toThrowError(
        new BadRequestException('User does not exist'),
      );
    });

    it('should throw a BadRequestException error if password invalid', async () => {
      await expect(
        service.signinLocal({ ...signinDto, password: '4321' }),
      ).rejects.toThrowError(new BadRequestException('Password invalid'));
    });
  });

  describe('logout', () => {
    it('should successfully logout a user', async () => {
      await expect(service.logout(Date.now())).resolves.toEqual(true);
    });
  });
});
