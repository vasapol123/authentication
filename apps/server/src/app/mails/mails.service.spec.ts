import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { MailsService } from './mails.service';
import { MailerService } from '@nestjs-modules/mailer';
import { SendMailPayload } from '@authentication/types';
import { faker } from '@faker-js/faker';

import { createRandomUser } from '../../test/unit/fixtures/user.fixture';

describe('AppService', () => {
  let service: MailsService;
  const fakeUser = createRandomUser();

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const payload: SendMailPayload = {
    toEmail: fakeUser.email,
    userId: fakeUser.id,
    displayName: fakeUser.displayName,
    forgotPasswordToken: expect.anything(),
  };

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailerService)
      .useValue(mockMailerService)
      .compile();

    service = app.get<MailsService>(MailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendResetPassword', () => {
    const sendMailOptions = {
      from: faker.internet.email(),
      subject: faker.hacker.noun(),
    };

    it('should call MailerService with expected params', async () => {
      await service.sendResetPasswordEmail(payload, sendMailOptions);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: payload.toEmail,
        from: sendMailOptions.from,
        subject: sendMailOptions.subject,
        template: 'reset-password',
        context: {
          payload: payload,
        },
      });
    });

    it('should return fales if fail sending an email', async () => {
      jest
        .spyOn(mockMailerService, 'sendMail')
        .mockRejectedValueOnce(new Error());

      await expect(
        service.sendResetPasswordEmail(payload, sendMailOptions),
      ).resolves.toBe(false);
    });

    it('should return true if send an email', async () => {
      await expect(
        service.sendResetPasswordEmail(payload, sendMailOptions),
      ).resolves.toBe(true);
    });
  });
});
