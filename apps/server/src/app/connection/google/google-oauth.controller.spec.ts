import { Test, TestingModule } from '@nestjs/testing';
import { ExternalAuths } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { Request } from 'express';

import { AppModule } from '../../app.module';
import { createRandomUser } from '../../../test/unit/fixtures/user.fixture';
import { createRandomExternalAuth } from '../../../test/unit/fixtures/external-auth.fixture';
import { GoogleOauthController } from './google-oauth.controller';
import { AuthTokens, UserProfile } from '@authentication/types';
import { GoogleOauthService } from './google-oauth.service';
import { SigninDto } from '../../auth/dto/signin.dto';

describe('GoogleOathController', () => {
  let controller: GoogleOauthController;
  const fakeUser = createRandomUser();
  const externalAuth: ExternalAuths = createRandomExternalAuth();
  const userProfile: UserProfile = {
    email: fakeUser.email,
    displayName: fakeUser.displayName,
    provider: externalAuth.provider,
    providerId: externalAuth.providerId,
  };

  const mockRequest = {
    user: userProfile,
  } as unknown as Request;

  const mockGoogleOauthService = {
    signinGoogle: jest.fn<Promise<AuthTokens>, []>().mockResolvedValue({
      jwtAccessToken: faker.datatype.uuid(),
      jwtRefreshToken: faker.datatype.uuid(),
    }),
    connectLocal: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GoogleOauthService)
      .useValue(mockGoogleOauthService)
      .compile();

    controller = module.get<GoogleOauthController>(GoogleOauthController);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('googleAuthSignin', () => {
    it('should return tokens when a user is signed in with google', async () => {
      await expect(controller.googleAuthSignin(mockRequest)).resolves.toEqual({
        jwtAccessToken: expect.any(String),
        jwtRefreshToken: expect.any(String),
      });
    });

    it('should call GoogleOauthService with expected params', async () => {
      await controller.googleAuthSignin(mockRequest);

      expect(mockGoogleOauthService.signinGoogle).toHaveBeenCalledWith(
        mockRequest.user,
      );
    });
  });

  describe('googleAuthConnect', () => {
    const connectionDto: SigninDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    it('should call GoogleOauthService with expected params', async () => {
      await controller.googleAuthConnect(mockRequest, connectionDto);

      expect(mockGoogleOauthService.connectLocal).toHaveBeenCalledWith(
        mockRequest.user,
        connectionDto,
      );
    });
  });
});
