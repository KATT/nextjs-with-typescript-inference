import { InferGetServerSidePropsType } from 'next'
import Layout from '../components/Layout'
import { makeSSRFunctions, playgroundResolver } from './api/playground'

const ssr = makeSSRFunctions(playgroundResolver)

const PlaygroundPage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <Layout title="Playground">
      <h1>Playground</h1>
      <h2>From props:</h2>
      <pre>{JSON.stringify(props, null, 4)}</pre>
      <p>test type safety: {props.data.foo}</p>
    </Layout>
  )
}


export const getServerSideProps = async (ctx: any) => {
  return ssr.getServerSideProps(ctx)
}



export default PlaygroundPage
