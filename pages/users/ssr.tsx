import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/dist/client/router';
import { Suspense, useState } from 'react';
import useSWR from 'swr';
import { jsonPost, swrFetcher } from '../../blite/client';
import { PageContent, PageHeader } from '../../components/Layout';
import NoSSR from '../../components/NoSSR';
import { createUserSchemaType } from '../../types/schemas';
import { getAllUsers } from '../api/db';

function AddUserForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        console.log('sending', { name });
        setSubmitting(true);
        await jsonPost<createUserSchemaType>({
          path: '/api/users/create',
          body: { name },
        });
        await router.replace({
          pathname: router.pathname,
          query: router.query,
        }); // "reload" page to get new data
        console.log('done');
        setName('');
        setSubmitting(false);
      }}
    >
      <p>
        <label>
          Name:{' '}
          <input
            name='name'
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
          />
        </label>
      </p>
      <input type='submit' disabled={submitting} />
    </form>
  );
}
function SWRComponent() {
  const { data } = useSWR('/api/users', swrFetcher, { suspense: true });

  return <pre className='text-xs'>{JSON.stringify(data, null, 4)}</pre>;
}

export default function UsersIndexPage({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <PageHeader>Users</PageHeader>
      <PageContent>
        <p className='text-base font-bold mb-4'>
          Example fetching data from inside <code>getServerSideProps()</code>.
        </p>
        <p className='text-base mb-4 italic'>
          You are currently on:{' '}
          <span className='font-mono not-italic'>/users</span>
        </p>
        <table className='text-xs shadow round px-2 py-2 inline-block mb-4 bg-gray-100'>
          <thead>
            <tr className='font-bold text-left border-gray-200 border-b'>
              <th className='px-2 py-1'>ID</th>
              <th className='px-2 py-1'>Name</th>
              <th className='px-2 py-1'>Created At</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((user) => (
              <tr key={user.id}>
                <td className='px-2 py-1'>{user.id}</td>
                <td className='px-2 py-1'>{user.name}</td>
                <td className='px-2 py-1'>
                  {user.createdAt.toLocaleDateString('sv-SE')}{' '}
                  {user.createdAt.toLocaleTimeString('sv-SE')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <pre className='text-xs'>{JSON.stringify(data, null, 4)}</pre>
        <hr className='my-4' />

        <hr className='my-4' />
        <h2>Add user</h2>
        <AddUserForm />
      </PageContent>
    </>
  );
}
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  // ctx.res.setHeader('cache-control', 'stale-while-revalidate=6000');
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    props: {
      data: {
        users: await getAllUsers(),
      },
    },
  };
};
