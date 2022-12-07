import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signupLocal: jest.fn().mockImplementation((dto) => {
      return Promise.resolve({
        jwtAccessToken: 'fakeJwtAccessToken',
        jwtRefreshToken: 'fakeJwtRefreshToken',
      });
    }),
    signinLocal: jest.fn().mockImplementation((dto) => {
      return Promise.resolve({
        jwtAccessToken: 'fakeJwtAccessToken',
        jwtRefreshToken: 'fakeJwtRefreshToken',
      });
    }),
    rotateRefreshTokens: jest.fn().mockImplementation((dto) => {
      return Promise.resolve({
        jwtAccessToken: 'fakeJwtAccessToken',
        jwtRefreshToken: 'fakeJwtRefreshToken',
      });
    }),
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

  describe('signupLocal', () => {
    it('should successfully sign up a user', async () => {
      const signupDto: SignupDto = {
        email: 'jonathan@example.com',
        displayName: 'Jonathan',
        password: 'fakeHashedPassword',
      };

      await expect(controller.signupLocal(signupDto)).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });

      expect(mockAuthService.signupLocal).toHaveBeenCalledWith(signupDto);
    });
  });

  describe('signinLocal', () => {
    it('should successfully sign in a user', async () => {
      const signinDto: SigninDto = {
        email: 'jonathan@example.com',
        password: 'fakeHashedPassword',
      };

      await expect(controller.signinLocal(signinDto)).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });

      expect(mockAuthService.signinLocal).toHaveBeenCalledWith(signinDto);
    });
  });

  describe('logout', () => {
    it('should successfully logout a user', async () => {
      await expect(controller.logout(Date.now())).resolves.toEqual(true);
    });
  });

  describe('rotateRefreshToken', () => {
    it('shouch perform refresh token rotation', async () => {
      await expect(
        controller.rotateRefreshToken(Date.now(), 'fakeJwtRefreshToken'),
      ).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });
    });
  });
});
