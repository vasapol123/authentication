import { ExternalAuths } from '@prisma/client';
import { faker } from '@faker-js/faker';

function createRandomExternalAuth(): ExternalAuths {
  return {
    id: faker.datatype.number(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    provider: faker.company.name(),
    providerId: faker.datatype.uuid(),
    userId: faker.datatype.number(),
  };
}

export { createRandomExternalAuth };
