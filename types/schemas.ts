import * as z from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1),
});

export type createUserSchemaType = z.infer<typeof createUserSchema>;
