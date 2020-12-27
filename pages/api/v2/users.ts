import { assertOnServer, createAPIHandler } from '../../../blite/server';

assertOnServer('api endpoint');

export default createAPIHandler(async () => {
  return {
    ok: true,
    data: {
      foo: 'bar',
    },
  };
});
