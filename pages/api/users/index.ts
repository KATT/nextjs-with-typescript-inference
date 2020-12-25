import { endpointHandler, InferGetDataFunction } from '../../../blite/blite';
import { getAllUsers } from '../db';

export const getAllUsersResolver: InferGetDataFunction<
  typeof getAllUsers
> = async () => {
  const data = await getAllUsers();
  return {
    data,
  };
};

export default endpointHandler(getAllUsersResolver);
