// Mock db
import { v4 } from 'uuid';
import { assertOnServer } from '../../blite/server';
import {
  createPostSchema,
  createPostSchemaType,
  createUserSchema,
  createUserSchemaType,
} from '../../types/schemas';
import { User } from '../../types/typeUtils';

const DB = {
  users: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'ooaazzaoo',
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
  posts: [
    {
      id: '10000000-0000-0000-0000-000000000001',
      title: 'hello',
      createdAt: new Date(2020, 12, 26),
    },
  ],
};

export async function getAllUsers() {
  // await new Promise((resolve) => setTimeout(resolve, 1000));
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

export async function getAllPosts() {
  return DB['posts'];
}
export async function createPost(input: createPostSchemaType) {
  const parsed = createPostSchema.safeParse(input);

  if (!parsed.success) {
    return {
      input,
      success: false as const,
      error: parsed.error,
    };
  }

  const instance = {
    ...createPostSchema.parse(input),
    id: v4(),
    createdAt: new Date(),
  };
  DB.posts.push(instance);
  console.log('added', instance, DB.posts);

  return {
    input,
    success: true as const,
    data: instance,
  };
}

assertOnServer('db.ts');
