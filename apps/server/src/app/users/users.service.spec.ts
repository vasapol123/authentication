import { faker } from '@faker-js/faker';
import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, User } from '@prisma/client';

import { createRandomUser } from '../../test/unit/fixtures/user.fixture';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const fakeUser = createRandomUser();
  const fakeUserArray: Array<User> = [createRandomUser(), createRandomUser()];

  const mockPrismaService = {
    user: {
      create: jest.fn<Promise<User>, []>().mockResolvedValue(fakeUser),
      update: jest.fn<Promise<User>, []>().mockResolvedValue(fakeUser),
      findUnique: jest.fn<Promise<User>, []>().mockResolvedValue(fakeUser),
      findMany: jest.fn<Promise<User[]>, []>().mockResolvedValue(fakeUserArray),
      delete: jest.fn<Promise<User>, []>().mockResolvedValue(fakeUser),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      email: fakeUser.email,
      displayName: fakeUser.displayName,
      hashedPassword: fakeUser.hashedPassword,
    };

    it('should call PrismaService create with expected params', async () => {
      await service.createUser(createUserDto);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: expect.any(String),
          displayName: expect.any(String),
          hashedPassword: expect.any(String),
        },
      });
    });

    it('should create a new user record and return that', async () => {
      await expect(service.createUser(createUserDto)).resolves.toEqual(
        fakeUser,
      );
    });

    it('should throw a ForbiddenException error if the email is exist', () => {
      jest.spyOn(mockPrismaService.user, 'create').mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('error message', {
          code: 'P2002',
          clientVersion: 'clientVersion',
        }),
      );
      expect(service.createUser(createUserDto)).rejects.toThrowError(
        new ForbiddenException(
          'There is a unique constraint violation, a new user cannot be created with this email',
        ),
      );
    });
  });

  describe('updateUser', () => {
    const updateUserDto: UpdateUserDto = {
      email: fakeUser.email,
    };

    it('should call PrismaService update with expected params', async () => {
      await service.updateUser(fakeUser.id, updateUserDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: {
          id: fakeUser.id,
        },
        data: {
          email: fakeUser.email,
        },
      });
    });

    it('should update a user and return the user', async () => {
      await expect(
        service.updateUser(fakeUser.id, updateUserDto),
      ).resolves.toEqual(fakeUser);
    });

    it('should throw a ForbiddenException error if updated fail', async () => {
      jest.spyOn(mockPrismaService.user, 'update').mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('error message', {
          code: 'P2025',
          clientVersion: 'clientVersion',
        }),
      );

      await expect(
        service.updateUser(fakeUser.id, updateUserDto),
      ).rejects.toThrowError(
        new ForbiddenException(
          'An operation failed because user does not exist',
        ),
      );
    });
  });

  describe('findUserByEmail', () => {
    it('should get a single user', async () => {
      await expect(service.findUserByEmail(fakeUser.email)).resolves.toEqual(
        fakeUser,
      );
    });
  });

  describe('findUserById', () => {
    it('should get a single user', async () => {
      await expect(service.findUserById(fakeUser.id)).resolves.toEqual(
        fakeUser,
      );
    });
  });

  describe('findUsersByIds', () => {
    it('should return an array of users', async () => {
      await expect(
        service.findUsersByIds([
          faker.datatype.number(),
          faker.datatype.number(),
        ]),
      ).resolves.toEqual(fakeUserArray);
    });
  });

  describe('deleteUser', () => {
    it('should call PrismaService delete with expected params', async () => {
      await service.deleteUser(fakeUser.id);

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: {
          id: fakeUser.id,
        },
      });
    });

    it('should delete a user and return the user', async () => {
      await expect(service.deleteUser(fakeUser.id)).resolves.toEqual(fakeUser);
    });
  });
});
