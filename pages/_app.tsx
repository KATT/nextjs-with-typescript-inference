// import App from "next/app";
import Head from 'next/head';
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Hydrate } from 'react-query/hydration';
import { Header } from '../components/Layout';
import type { AppProps /*, AppContext */ } from 'next/app';

// import { animated, Transition } from 'react-spring';
import '../styles/globals.css';
import { useRouter } from 'next/dist/client/router';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  // const items = [
  //   {
  //     id: this.props.router.route,
  //     Component,
  //     pageProps,
  //   },
  // ];

  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string, opts: any) => {
      console.log(
        `App is changing to ${url} ${
          opts.shallow ? 'with' : 'without'
        } shallow routing`,
        opts,
      );
    };

    router.events.on('routeChangeStart', handleRouteChange);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <Head>
          <meta charSet='utf-8' />
          <meta
            name='viewport'
            content='initial-scale=1.0, width=device-width'
          />
        </Head>
        <div className='min-h-screen bg-gray-100'>
          <Header />
          <Component {...pageProps} />
          {/* <Transition
              items={items}
              keys={(item) => item.id}
              from={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              enter={{ opacity: 1 }}
              leave={{ opacity: 0, position: 'absolute' }}
            >
              {(styles, { pageProps, Component }) => (
                <animated.div style={{ ...styles, width: '100%' }}>
                  <Component {...pageProps} />
                </animated.div>
              )}
            </Transition> */}
        </div>
      </Hydrate>
    </QueryClientProvider>
  );
}
