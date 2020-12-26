import Link from 'next/link';
import { Suspense } from 'react';
import { Footer, PageContent, PageHeader } from '../components/Layout';

const AboutPage = () => (
  <>
    <PageHeader>About</PageHeader>
    <PageContent>
      <p>This is the about page</p>
      <p>
        <Link href='/'>
          <a>Go home</a>
        </Link>
      </p>
    </PageContent>
    {/* <Suspense fallback={null}>suspense test</Suspense> */}
    <Footer />
  </>
);

export default AboutPage;
