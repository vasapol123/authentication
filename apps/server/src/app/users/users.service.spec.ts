import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, User } from '@prisma/client';

import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const user: User = {
    id: Date.now(),
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'jonathan@example.com',
    displayName: 'Jonathan',
    hashedPassword: 'fakeHashedPassword',
    hashedRefreshToken: 'fakeRefreshToken',
  };

  const userArray: Array<User> = [user, user];

  const mockPrismaService = {
    user: {
      create: jest
        .fn()
        .mockImplementation((user) =>
          Promise.resolve({ id: Date.now(), ...user.data }),
        ),
      update: jest
        .fn()
        .mockImplementation((user) =>
          Promise.resolve({ id: Date.now(), ...user.data }),
        ),
      findUnique: jest.fn().mockResolvedValue(user),
      findMany: jest.fn().mockResolvedValue(userArray),
      delete: jest.fn().mockResolvedValue(user),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      email: 'william@example.com',
      displayName: 'William',
      hashedPassword: 'newHashedPassword',
    };

    it('should create a new user record and return that', () => {
      expect(service.createUser(createUserDto)).resolves.toEqual({
        id: expect.any(Number),
        ...createUserDto,
      });

      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should throw a ForbiddenException error', () => {
      jest.spyOn(mockPrismaService.user, 'create').mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('message', {
          code: 'P2002',
          clientVersion: 'clientVersion',
        }),
      );
      expect(service.createUser(createUserDto)).rejects.toThrowError(
        ForbiddenException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update a user and return the user', () => {
      const updateUserDto: UpdateUserDto = {
        id: Date.now(),
        email: 'example3@test.com',
      };

      expect(service.updateUser(updateUserDto)).resolves.toEqual({
        id: expect.any(Number),
        email: updateUserDto.email,
      });

      expect(mockPrismaService.user.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('findUserByEmail', () => {
    it('should get a single user', () => {
      expect(service.findUserByEmail(user.email)).resolves.toEqual(user);
    });
  });

  describe('findUserById', () => {
    it('should get a single user', () => {
      expect(service.findUserById(Date.now())).resolves.toEqual(user);
    });
  });

  describe('findUsersByIds', () => {
    it('should return an array of users', () => {
      expect(service.findUsersByIds([Date.now(), Date.now()])).resolves.toEqual(
        userArray,
      );
    });
  });

  describe('deleteUser', () => {
    it('should call the delete method once', async () => {
      await service.deleteUser(Date.now());

      expect(mockPrismaService.user.delete).toHaveBeenCalledTimes(1);
    });
  });
});
