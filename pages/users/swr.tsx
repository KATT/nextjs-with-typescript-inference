import { useRouter } from 'next/dist/client/router';
import { Suspense, useState } from 'react';
import { jsonPost, useAPI } from '../../blite/__legacy/client';
import { PageContent, PageHeader } from '../../components/Layout';
import NoSSR from '../../components/NoSSR';
import { createUserSchemaType } from '../../types/schemas';
import { User } from '../../types/User';

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
  const data = useAPI<User[]>('/api/users');
  return <pre className='text-xs'>{JSON.stringify(data, null, 4)}</pre>;
}

export default function UsersIndexPage() {
  return (
    <>
      <PageHeader>Users</PageHeader>
      <PageContent>
        <h2 className='text-xl font-bold'>Using SWR</h2>

        <NoSSR>
          <Suspense fallback={<div className='italic'>Loading</div>}>
            <SWRComponent />
          </Suspense>
        </NoSSR>
        <hr className='my-4' />
        <h2>Add user</h2>
        <AddUserForm />
      </PageContent>
    </>
  );
}
