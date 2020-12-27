import {
  endpointHandler,
  InferGetDataFunction,
} from '../../../blite/__legacy/server';
import { createUser } from '../db';

export const createUserResolver: InferGetDataFunction<
  typeof createUser
> = async (ctx) => {
  const data = await createUser(ctx.req.body);
  return {
    data,
  };
};

export default endpointHandler(createUserResolver);
