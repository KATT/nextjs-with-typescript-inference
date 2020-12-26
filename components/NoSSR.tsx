import dynamic from 'next/dynamic';
import React, { ReactNode } from 'react';

const NoSSR = (props: { children: ReactNode }) => (
  <React.Fragment>{props.children}</React.Fragment>
);

export default dynamic(() => Promise.resolve(NoSSR), {
  ssr: false,
  loading() {
    return <>loading</>;
  },
});
