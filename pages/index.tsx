import Link from 'next/link';
import { Footer, PageContent, PageHeader } from '../components/Layout';

const IndexPage = () => (
  <>
    <PageHeader>Hello Next.js 👋</PageHeader>
    <PageContent>
      <p>
        <Link href='/about'>
          <a>About</a>
        </Link>
      </p>
    </PageContent>
    <Footer />
  </>
);

export default IndexPage;
