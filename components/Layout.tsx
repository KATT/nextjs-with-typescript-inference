import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import { ReactNode, ReactNodeArray } from 'react';

const routes: [string, string][] = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/users', 'Users'],
  ['/playground', 'Playground'],
];
export const Header = () => {
  const router = useRouter();
  return (
    <div className='bg-indigo-600 pb-32'>
      <nav className='bg-indigo-600 border-b border-indigo-300 border-opacity-25 lg:border-none'>
        <div className='max-w-7xl mx-auto px-2 sm:px-4 lg:px-8'>
          <div className='relative h-16 flex items-center justify-between lg:border-b lg:border-indigo-400 lg:border-opacity-25'>
            <div className='px-2 flex items-center lg:px-0'>
              <div className='flex-shrink-0'>
                <img
                  className='block h-8 w-8'
                  src='https://tailwindui.com/img/logos/workflow-mark-indigo-300.svg'
                  alt='Workflow'
                />
              </div>
              <div className='hidden lg:block lg:ml-10'>
                <div className='flex space-x-4'>
                  {/* Current: "bg-indigo-700 text-white", Default: "text-white hover:bg-indigo-500 hover:bg-opacity-75" */}
                  {routes.map(([to, title]) => (
                    <Link href={to} key={to}>
                      <a
                        key={to}
                        className={
                          to === router.asPath
                            ? 'bg-indigo-700 text-white rounded-md py-2 px-3 text-sm font-medium'
                            : 'text-white hover:bg-indigo-500 hover:bg-opacity-75 rounded-md py-2 px-3 text-sm font-medium'
                        }
                      >
                        {title}
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export function PageHeader({ children }: { children: ReactNode }) {
  return (
    <header className='-mt-32 py-10'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <h1 className='text-3xl font-bold text-white'>{children}</h1>
      </div>
    </header>
  );
}
export function PageContent({ children }: { children: ReactNode }) {
  return (
    <>
      <main>
        <div className='max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8'>
          {/* Replace with your content */}
          <div className='bg-white rounded-lg shadow px-5 py-6 sm:px-6'>
            {children}
          </div>
          {/* /End replace */}
        </div>
      </main>
    </>
  );
}
export function Layout({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div>
      <header className='-mt-32 py-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h1 className='text-3xl font-bold text-white'>{title}</h1>
        </div>
      </header>
      <main>
        <div className='max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8'>
          {/* Replace with your content */}
          <div className='bg-white rounded-lg shadow px-5 py-6 sm:px-6'>
            {children}
          </div>
          {/* /End replace */}
        </div>
      </main>
    </div>
  );
}

export const Footer = () => (
  <footer>
    <hr />
    <span>I'm here to stay (Footer)</span>
  </footer>
);
