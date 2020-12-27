import { createAPIHandler } from '../../../blite/server';

export default createAPIHandler(async () => {
  return {
    ok: true,
    data: {
      foo: 'bar',
    },
  };
});
