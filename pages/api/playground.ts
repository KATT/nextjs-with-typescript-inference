import { endpointHandler, InferGetDataFunction } from '../../blite/server';

async function playgroundDataFetcher() {
  return {
    foo: 'bar',
  };
}

export const playgroundResolver: InferGetDataFunction<
  typeof playgroundDataFetcher
> = async () => {
  const data = await playgroundDataFetcher();
  return {
    data,
  };
};

export default endpointHandler(playgroundResolver);
