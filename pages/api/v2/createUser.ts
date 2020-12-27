import { apiMutationHandler } from '../../../blite/server';
import { createUser } from '../db';
import { CreateUserSchema } from './createUser.shared';

export default apiMutationHandler({
  schema: CreateUserSchema,
  async callback(ctx) {
    return {
      ok: true,
      data: await createUser(ctx.input),
    };
  },
});
