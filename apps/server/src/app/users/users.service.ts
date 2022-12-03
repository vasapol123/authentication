import { Injectable, ForbiddenException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { omit } from 'lodash';

import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
        },
      });

      return user;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ForbiddenException(
            'There is a unique constraint violation, a new user cannot be created with this email',
          );
        }
      }
      throw e;
    }
  }

  public async updateUser(updateUserDto: UpdateUserDto): Promise<User> {
    const data = omit(updateUserDto, 'id');

    try {
      const user = await this.prisma.user.update({
        where: {
          id: updateUserDto.id,
        },
        data,
      });

      return user;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new ForbiddenException(
            'An operation failed because user does not exist',
          );
        }
      }
      throw e;
    }
  }

  public async findUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    return user;
  }

  public async findUserById(userId: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  }

  public async findUsersByIds(userIds: Array<number>): Promise<Array<User>> {
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
    });

    return users;
  }

  public async deleteUser(userId: number): Promise<User> {
    const user = await this.prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return user;
  }
}
