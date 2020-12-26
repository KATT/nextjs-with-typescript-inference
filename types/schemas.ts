import * as z from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1),
});

export type createUserSchemaType = z.infer<typeof createUserSchema>;

export const createPostSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});
export type createPostSchemaType = z.infer<typeof createPostSchema>;
