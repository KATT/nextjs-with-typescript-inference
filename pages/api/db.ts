// Mock db
import * as z from 'zod';
import { v4 } from 'uuid';
import { createUserSchema, createUserSchemaType } from '../../types/schemas';

const DB = {
  users: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Alice',
      createdAt: new Date(2020, 12, 24),
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Bob',
      createdAt: new Date(2020, 12, 24),
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Caroline',
      createdAt: new Date(2020, 12, 24),
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Dave',
      createdAt: new Date(2020, 12, 24),
    },
  ],
};
type User = typeof DB.users[number];

export async function getAllUsers() {
  return DB.users;
}

export async function createUser(user: createUserSchemaType) {
  const input = createUserSchema.parse(user);
  const instance: User = {
    ...input,
    id: v4(),
    createdAt: new Date(),
  };
  DB.users.push(instance);

  return instance;
}
