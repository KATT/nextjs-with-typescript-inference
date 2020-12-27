import { apiQueryHandler } from '../../../blite/server';

export default apiQueryHandler(async () => {
  return {
    ok: true,
    data: {
      foo: 'bar',
    },
  };
});
