import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as argon2 from 'argon2';

import { AuthService } from './auth.service';
import { TokensService } from '../tokens/tokens.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { AppModule } from '../app.module';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailsService } from '../mails/mails.service';
import {
  AuthTokens,
  ForgotPasswordToken,
  SendMailPayload,
} from '@authentication/types';

jest.mock('argon2');

function createRandomUser(): User {
  return {
    id: faker.datatype.number(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    email: faker.internet.email(),
    displayName: faker.name.firstName(),
    hashedPassword: faker.datatype.uuid(),
    hashedRefreshToken: faker.datatype.uuid(),
  };
}

describe('AuthService', () => {
  let service: AuthService;
  const fakeUser = createRandomUser();

  const payload: SendMailPayload = {
    toEmail: fakeUser.email,
    userId: fakeUser.id,
    displayName: fakeUser.displayName,
    forgotPasswordToken: expect.anything(),
  };

  const mockTokensService = {
    getTokens: jest.fn<Promise<AuthTokens>, []>().mockResolvedValue({
      jwtAccessToken: faker.datatype.uuid(),
      jwtRefreshToken: faker.datatype.uuid(),
    }),
    getForgotPasswordToken: jest
      .fn<Promise<ForgotPasswordToken>, []>()
      .mockResolvedValue(faker.datatype.uuid()),
    updateRefreshToken: jest.fn(),
    verifyToken: jest
      .fn<Promise<SendMailPayload>, []>()
      .mockResolvedValue(payload),
  };

  const mockUsersService = {
    createUser: jest.fn().mockResolvedValue(fakeUser),
    findUserByEmail: jest.fn().mockResolvedValue(fakeUser),
    findUserById: jest.fn().mockResolvedValue(fakeUser),
    updateUser: jest.fn().mockResolvedValue(fakeUser),
  };

  const mockMailsService = {
    sendResetPasswordEmail: jest.fn().mockResolvedValue(true),
  };

  const mockPrismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .overrideProvider(TokensService)
      .useValue(mockTokensService)
      .overrideProvider(MailsService)
      .useValue(mockMailsService)
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signupLocal', () => {
    const hashedPassword = faker.datatype.uuid();

    const signupDto: SignupDto = {
      email: faker.internet.email(),
      displayName: faker.internet.userName(),
      password: faker.internet.password(),
    };

    jest.spyOn(argon2, 'hash').mockResolvedValue(hashedPassword);

    it('should call usersService with expect params', async () => {
      await service.signupLocal(signupDto);

      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        email: signupDto.email,
        displayName: signupDto.displayName,
        hashedPassword,
      });
    });

    it('should call tokensService with expect params', async () => {
      await service.signupLocal(signupDto);

      expect(mockTokensService.getTokens).toHaveBeenCalledWith(
        fakeUser.id,
        fakeUser.email,
        fakeUser.displayName,
      );
      expect(mockTokensService.updateRefreshToken).toHaveBeenCalledWith(
        fakeUser.id,
        expect.anything(),
      );
    });

    it('should sign up a user', async () => {
      await expect(service.signupLocal(signupDto)).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });
    });
  });

  describe('signinLocal', () => {
    jest
      .spyOn(argon2, 'verify')
      .mockImplementation(() => Promise.resolve(true));

    const signinDto: SigninDto = {
      email: fakeUser.email,
      password: faker.internet.password(10),
    };

    it('should throw a BadRequestException error if user does not exist', async () => {
      jest
        .spyOn(mockUsersService, 'findUserByEmail')
        .mockResolvedValueOnce(undefined);

      await expect(service.signinLocal(signinDto)).rejects.toThrowError(
        new BadRequestException('User does not exist'),
      );
    });

    it('should throw a BadRequestException error if password invalid', async () => {
      jest
        .spyOn(argon2, 'verify')
        .mockImplementationOnce(() => Promise.resolve(false));

      await expect(
        service.signinLocal({
          ...signinDto,
          password: faker.internet.password(15),
        }),
      ).rejects.toThrowError(new BadRequestException('Password invalid'));
    });

    it('should call tokensService with expect params', async () => {
      await service.signinLocal(signinDto);

      expect(mockTokensService.getTokens).toHaveBeenCalledWith(
        fakeUser.id,
        fakeUser.email,
        fakeUser.displayName,
      );
      expect(mockTokensService.updateRefreshToken).toHaveBeenCalledWith(
        fakeUser.id,
        expect.anything(),
      );
    });

    it('should get tokens when a user is signed in', async () => {
      await expect(service.signinLocal(signinDto)).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      await expect(service.logout(Date.now())).resolves.toEqual(true);
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: fakeUser.email,
    };

    it('should throw a BadRequestException error if user does not exist', async () => {
      jest
        .spyOn(mockUsersService, 'findUserByEmail')
        .mockResolvedValueOnce(undefined);

      await expect(
        service.forgotPassword(forgotPasswordDto),
      ).rejects.toThrowError(
        new BadRequestException('User does not exist with the specified email'),
      );
    });

    it('should call tokensService with expect params', async () => {
      await service.forgotPassword(forgotPasswordDto);

      expect(mockTokensService.getForgotPasswordToken).toHaveBeenCalledWith(
        fakeUser.id,
        fakeUser.email,
        fakeUser.hashedPassword,
      );
    });

    it('should call MailsSerive with expect params', async () => {
      await service.forgotPassword(forgotPasswordDto);

      expect(mockMailsService.sendResetPasswordEmail).toHaveBeenCalledWith(
        payload,
        {
          from: process.env.DEFAULT_EMAIL_FROM,
          subject: 'Reset Password',
        },
      );
    });

    it('should throw a ForbiddenException error if fail sending an email', async () => {
      jest
        .spyOn(mockMailsService, 'sendResetPasswordEmail')
        .mockResolvedValue(false);

      await expect(
        service.forgotPassword(forgotPasswordDto),
      ).rejects.toThrowError(new ForbiddenException('Send email error'));
    });
  });

  describe('extractSendMailPayload', () => {
    const forgotPasswordToken: ForgotPasswordToken = faker.datatype.uuid();

    it('should throw a BadRequestException error if user does not exist', async () => {
      jest
        .spyOn(mockUsersService, 'findUserById')
        .mockResolvedValueOnce(undefined);

      await expect(
        service.extractSendMailPayload(fakeUser.id, forgotPasswordToken),
      ).rejects.toThrowError(new BadRequestException('User does not exist'));
    });

    it('should call tokensService with expected params', async () => {
      await service.extractSendMailPayload(fakeUser.id, forgotPasswordToken);

      const secret =
        process.env.JWT_FORGOT_PASSWORD_SECRET + fakeUser.hashedPassword;

      expect(mockTokensService.verifyToken).toHaveBeenCalledWith(
        forgotPasswordToken,
        secret,
      );
    });

    it('should return payload', async () => {
      await expect(
        service.extractSendMailPayload(fakeUser.id, forgotPasswordToken),
      ).resolves.toEqual({
        toEmail: expect.any(String),
        userId: expect.any(Number),
        displayName: expect.any(String),
        forgotPasswordToken: expect.anything(),
      });
    });
  });
});
