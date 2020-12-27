import { PageContent, PageHeader } from 'components/Layout';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import getAllUsers from './api/v2/users';
type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

export default function UsersIndexPage(props: Props) {
  return (
    <>
      <PageHeader>Users</PageHeader>
      <PageContent>
        <pre>{JSON.stringify(props, null, 4)}</pre>
      </PageContent>
    </>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return {
    props: await getAllUsers(ctx.req),
  };
};
