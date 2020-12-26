import App from 'next/app';
import React from 'react';
import { animated, Transition } from 'react-spring';
import '../styles/globals.css';
import Head from 'next/head';
import { Header, Footer, Layout } from '../components/Layout';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Hydrate } from 'react-query/hydration';

const queryClient = new QueryClient();

export default class MyApp extends App {
  static async getInitialProps({ Component, router, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;
    const items = [
      {
        id: this.props.router.route,
        Component,
        pageProps,
      },
    ];

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
            <Transition
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
            </Transition>
          </div>
        </Hydrate>
      </QueryClientProvider>
    );
  }
}
