import '../styles/globals.css';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { SWRConfig } from 'swr';
import useUser from '@libs/client/useUser';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Script from 'next/script';

function MyApp({ Component, pageProps }: AppProps) {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!router || !user) return;
    if (!user && router.pathname !== '/signup') {
      router.push('/login');
      return;
    }
  }, [user, router]);

  return (
    <>
      <Script src="https://unpkg.com/peerjs@1.3.1/dist/peerjs.min.js"></Script>
      <Head>
        <title>NextJS TailwindCSS TypeScript Starter</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <SWRConfig
        value={{
          fetcher: (url: string) => fetch(url).then((response) => response.json()),
        }}
      >
        <Component {...pageProps} />
      </SWRConfig>
    </>
  );
}

export default MyApp;
