import { IncomingMessage } from 'http';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/dist/client/router';
import { parse, ParsedUrlQuery } from 'querystring';
import { Footer, PageContent, PageHeader } from '../../components/Layout';
import { FunctionThenArg } from '../../types/typeUtils';
import { createPost, getAllPosts } from '../api/db';

const IndexPage = ({
  posts,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const route = useRouter();
  return (
    <>
      <PageHeader>Hello PHP👋</PageHeader>
      <PageContent>
        <div>
          <h1>Posts</h1>
          {posts.map((post) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </div>
        <p>
          <form action={route.asPath} method='post'>
            <p>
              <label>
                Title
                <input type='text' name='title' />
              </label>
            </p>
            <p>
              <input type='submit' />
            </p>
          </form>
        </p>
      </PageContent>
      <Footer />
    </>
  );
};

async function getBody(req: IncomingMessage) {
  return new Promise<ParsedUrlQuery | null>((resolve) => {
    if (req.method !== 'POST') {
      return resolve(null);
    }
    let body: string = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      console.log('end', body);
      resolve(body ? parse(body) : null);
    });
  });
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  // ctx.res.setHeader('cache-control', 'stale-while-revalidate=6000');
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  // handle form post
  console.log('ctx', ctx.req.method);
  const body = await getBody(ctx.req);
  let formData: FunctionThenArg<typeof createPost> | null = null;
  console.log('body', body);
  if (body) {
    formData = await createPost(body as any);
    console.log('formData', formData);
  }
  return {
    props: {
      posts: await getAllPosts(),
      formData,
    },
  };
};

export default IndexPage;
