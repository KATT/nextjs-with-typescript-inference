import * as z from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(1),
});

export const CreateUserPath = '/api/v2/createUser';
