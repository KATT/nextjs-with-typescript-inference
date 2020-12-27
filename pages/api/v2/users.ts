import { apiQueryHandler } from '../../../blite/server';
import { getAllUsers } from '../db';

export default apiQueryHandler(async () => {
  return {
    ok: true,
    data: await getAllUsers(),
  };
});
