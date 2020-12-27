import { HttpError } from '../../../blite/BliteError';
import { assertOnServer, createAPIHandler } from '../../../blite/server';

assertOnServer('api endpoint');

export default createAPIHandler(async () => {
  throw new HttpError(400);
  return {
    ok: true,
    data: {
      foo: 'bar',
    },
  };
});
