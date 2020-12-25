import { InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/dist/client/router'
import { useEffect, useState } from 'react'
import { deserialize } from 'superjson'
import { SuperJSONResult } from 'superjson/dist/types'
import Layout from '../../components/Layout'
import { createUserSchemaType } from '../../types/schemas'
import { getAllUsers } from '../api/db'


function useStateFromProp<TProp>(props: TProp) {
  const [state, setState] = useState(props)

  useEffect(() => {
    // reset on prop change
    setState(props)
  }, [props])

  return [state, setState] as const
}

async function jsonPost<TBody, TResponse = unknown>(opts: {
  body: TBody,
  path: string,
}) {
  const res = await fetch(opts.path, {
    method: 'post',
    body: JSON.stringify(opts.body),
    headers: {
      'content-type': 'application/json',
    }
  })
  const json: SuperJSONResult = await res.json()

  return deserialize(json) as TResponse;
}

function AddUserForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();

      console.log('sending', { name })
      setSubmitting(true)
      await jsonPost<createUserSchemaType>({
        path: '/api/users',
        body: { name },
      })
      await router.replace(router.pathname, undefined) // "reload" page to get new data
      console.log('done')
      setName('')
      setSubmitting(false)
    }}>
      <p><label>Name: <input name="name" type="text" value={name} onChange={e => setName(e.target.value)} disabled={submitting} /></label></p>
      <input type="submit" disabled={submitting} />
    </form>
  )
}


export default function UsersIndexPage({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [users] = useStateFromProp(data.users)

  return (
    <Layout title="Users List | Next.js + TypeScript Example">
      <h1>Users List</h1>
      <p>
        Example fetching data from inside <code>getStaticProps()</code>.
      </p>
      <p>You are currently on: /users</p>
      <table>
        <tbody>
          {users.map(user => <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td>{user.createdAt.toLocaleDateString('sv-SE')} {user.createdAt.toLocaleTimeString('sv-SE')}</td>
          </tr>)}
        </tbody>
      </table>
      <pre>{JSON.stringify(data, null, 4)}</pre>
      <hr />
      <h2>Add user</h2>
      <AddUserForm />
    </Layout>
  )
}
export const getServerSideProps = async () => {
  await new Promise(resolve => setTimeout(resolve, 500)) // simulate loading
  return {
    props: {
      data: {
        users: await getAllUsers()
      },
    }
  }
}
