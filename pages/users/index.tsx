import { InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import Layout from '../../components/Layout'
import List from '../../components/List'
import { GetUsersResponse } from '../api/users'

const WithStaticProps = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
  <Layout title="Users List | Next.js + TypeScript Example">
    <h1>Users List</h1>
    <p>
      Example fetching data from inside <code>getStaticProps()</code>.
    </p>
    <p>You are currently on: /users</p>
    <List items={data} />
    <p>
      <Link href="/">
        <a>Go home</a>
      </Link>
    </p>
  </Layout>
)

export const getServerSideProps = async () => {
  const baseUrl = `https://${process.env.VERCEL_URL}` ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/users`)
  const data: GetUsersResponse = await res.json()
  return {
    props: {
      data,
    }
  }
}

export default WithStaticProps
