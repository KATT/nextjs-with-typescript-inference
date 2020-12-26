import Link from 'next/link';
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
    <Footer />
  </>
);

export default AboutPage;
