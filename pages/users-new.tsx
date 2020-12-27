import { getServerSidePropsHelper } from 'blite/server';
import { PageContent, PageHeader } from 'components/Layout';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import getAllUsers from './api/v2/users';
type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
export default function UsersIndexPage(props: Props) {
  return (
    <>
      <PageHeader>Users</PageHeader>
      <PageContent>
        <h2 className='text-xl font-bold mb-4'>From props</h2>
        <pre>{JSON.stringify(props, null, 4)}</pre>
        <h2 className='text-xl font-bold mb-4'>From SWR</h2>
      </PageContent>
    </>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const res2 = await getServerSidePropsHelper(ctx, getAllUsers);
  return {
    props: {
      users: res2,
    },
  };
};
