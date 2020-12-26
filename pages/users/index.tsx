import { InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/dist/client/router';
import { useState } from 'react';
import { jsonPost } from '../../blite/client';
import { PageContent, PageHeader } from '../../components/Layout';
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

export default function UsersIndexPage({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <PageHeader>Users</PageHeader>
      <PageContent>
        <h1>Users List</h1>
        <p>
          Example fetching data from inside <code>getStaticProps()</code>.
        </p>
        <p>You are currently on: /users</p>
        <table>
          <tbody>
            {data.users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>
                  {user.createdAt.toLocaleDateString('sv-SE')}{' '}
                  {user.createdAt.toLocaleTimeString('sv-SE')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <pre>{JSON.stringify(data, null, 4)}</pre>
        <hr />
        <h2>Add user</h2>
        <AddUserForm />
      </PageContent>
    </>
  );
}
export const getServerSideProps = async () => {
  return {
    props: {
      data: {
        users: await getAllUsers(),
      },
    },
  };
};
