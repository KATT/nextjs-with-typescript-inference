import { InferGetServerSidePropsType } from 'next'
import Layout from '../../components/Layout'
import { getAllUsers } from '../api/db'

const WithStaticProps = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
  <Layout title="Users List | Next.js + TypeScript Example">
    <h1>Users List</h1>
    <p>
      Example fetching data from inside <code>getStaticProps()</code>.
    </p>
    <p>You are currently on: /users</p>
    <pre>{JSON.stringify(data, null, 4)}</pre>
    <pre>Date is Date? {data.date instanceof Date ? 'yes' : 'no'}</pre>
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
