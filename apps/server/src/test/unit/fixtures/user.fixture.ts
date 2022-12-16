import { User } from '@prisma/client';
import { faker } from '@faker-js/faker';

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

export { createRandomUser };
