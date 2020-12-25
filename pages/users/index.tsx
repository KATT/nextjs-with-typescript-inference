import { InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import Layout from '../../components/Layout'
import List from '../../components/List'
import { getAllUsers } from '../api/db'

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
  return {
    props: {
      data: await getAllUsers()
    }
  }
}

export default WithStaticProps
