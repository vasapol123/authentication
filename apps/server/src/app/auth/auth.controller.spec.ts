import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import { AuthTokens, JwtPayload, SendMailPayload } from '@authentication/types';

import { AppModule } from '../app.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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

describe('AuthController', () => {
  let controller: AuthController;
  const fakeUser = createRandomUser();

  const authTokens: AuthTokens = {
    jwtAccessToken: faker.datatype.uuid(),
    jwtRefreshToken: faker.datatype.uuid(),
  };

  const payload: SendMailPayload = {
    toEmail: fakeUser.email,
    userId: fakeUser.id,
    displayName: fakeUser.displayName,
    forgotPasswordToken: expect.anything(),
  };

  const mockAuthService = {
    signupLocal: jest
      .fn<Promise<AuthTokens>, []>()
      .mockResolvedValue(authTokens),
    signinLocal: jest
      .fn<Promise<AuthTokens>, []>()
      .mockResolvedValue(authTokens),
    forgotPassword: jest.fn(),
    rotateRefreshTokens: jest
      .fn<Promise<AuthTokens>, []>()
      .mockResolvedValue(authTokens),
    extractSendMailPayload: jest
      .fn<Promise<SendMailPayload>, []>()
      .mockResolvedValue(payload),
    resetPassword: jest.fn(),
    logout: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentUserInfo', () => {
    const user: JwtPayload = {
      sub: faker.datatype.number(),
      email: faker.internet.email(),
      displayName: faker.internet.userName(),
    };

    it('should get the current user infomation', () => {
      expect(controller.getCurrentUserInfo(user)).toEqual({
        sub: expect.any(Number),
        email: expect.any(String),
        displayName: expect.any(String),
      });
    });
  });

  describe('signupLocal', () => {
    it('should sign up a user', async () => {
      const signupDto: SignupDto = {
        email: faker.internet.email(),
        displayName: faker.internet.userName(),
        password: faker.internet.password(),
      };

      await expect(controller.signupLocal(signupDto)).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });

      expect(mockAuthService.signupLocal).toHaveBeenCalledWith(signupDto);
    });
  });

  describe('signinLocal', () => {
    it('should sign in a user', async () => {
      const signinDto: SigninDto = {
        email: fakeUser.email,
        password: faker.internet.password(),
      };

      await expect(controller.signinLocal(signinDto)).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });

      expect(mockAuthService.signinLocal).toHaveBeenCalledWith(signinDto);
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      await expect(controller.logout(Date.now())).resolves.toEqual(true);
    });
  });

  describe('forgotPassword', () => {
    it('should call forgotPassword with expected params', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: faker.internet.email(),
      };

      await controller.forgotPassword(forgotPasswordDto);

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto,
      );
    });
  });

  describe('extractSendMailPayload', () => {
    it('should return payload', async () => {
      const params = {
        id: String(faker.datatype.number()),
        token: faker.datatype.uuid(),
      };

      await expect(controller.extractSendMailPayload(params)).resolves.toEqual(
        payload,
      );

      expect(mockAuthService.extractSendMailPayload).toHaveBeenCalledWith(
        Number(params.id),
        params.token,
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      const newPassword = faker.internet.password();
      const resetPasswordDto: ResetPasswordDto = {
        newPassword,
        passwordConfirmation: newPassword,
      };
      const params = {
        id: String(faker.datatype.number()),
        token: faker.datatype.uuid(),
      };

      await controller.resetPassword(resetPasswordDto, params);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        Number(params.id),
        params.token,
        resetPasswordDto,
      );
    });
  });

  describe('rotateRefreshToken', () => {
    it('shouch perform refresh token rotation', async () => {
      await expect(
        controller.rotateRefreshToken(fakeUser.id, faker.datatype.uuid()),
      ).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });

      expect(mockAuthService.rotateRefreshTokens).toHaveBeenCalledWith(
        fakeUser.id,
        expect.any(String),
      );
    });
  });
});
