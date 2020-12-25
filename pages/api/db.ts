// Mock db
import * as z from 'zod';
import { assertOnServer } from '../../blite/blite';
const DB = {
  users: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Caroline' },
    { id: 4, name: 'Dave' },
  ],
};

let nextUserId = 5;

export async function getAllUsers() {
  return DB.users;
}

export const addUserSchema = z.object({
  name: z.string().min(1),
});

export async function addUser(user: z.infer<typeof addUserSchema>) {
  const input = addUserSchema.parse(user);
  const instance = {
    ...input,
    id: nextUserId++,
  };
  DB.users.push(instance);

  return instance;
}
