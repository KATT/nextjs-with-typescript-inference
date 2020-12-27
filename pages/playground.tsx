import { InferGetServerSidePropsType } from 'next';
import { useQuery } from 'react-query';
import { makeSSRFunctions } from '../blite/__legacy/server';
import { PageContent, PageHeader } from '../components/Layout';
import { FunctionThenArg } from '../types/typeUtils';
import { playgroundResolver } from './api/playground';

const ssr = makeSSRFunctions(playgroundResolver);

function usePlayground() {
  return useQuery<FunctionThenArg<typeof playgroundResolver>>(
    './api/playground',
    () => fetch('./api/playground').then((res) => res.json()),
  );
}

const PlaygroundPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  const reactQuery = usePlayground();

  return (
    <>
      <PageHeader>Playground</PageHeader>
      <PageContent>
        <div className='prose'>
          <h2>From props:</h2>
          <pre>{JSON.stringify(props, null, 4)}</pre>
          <p>test type safety: {props.data.foo}</p>
          <h2>React query</h2>
          <pre>{JSON.stringify(reactQuery.data, null, 4)}</pre>
          <p>test type safety: {reactQuery.data?.data.foo}</p>
        </div>
      </PageContent>
    </>
  );
};

export const getServerSideProps = async (ctx: any) => {
  return ssr.getServerSideProps(ctx);
};

export default PlaygroundPage;
