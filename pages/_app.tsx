import "../styles/globals.css";
import Head from "next/head";
import { AppProps } from "next/app";
import { SWRConfig } from "swr";
import useUser from "@libs/client/useUser";
import { useRouter } from "next/router";
import { useEffect } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  const { user } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (!user) return;
    if (router.pathname === "/enter" || router.pathname === "/signup") {
      if (user) {
        router.push("/");
      }
    } else {
      if (!user) {
        router.push("/enter");
      }
    }
  }, [user]);
  return (
    <>
      <Head>
        <title>NextJS TailwindCSS TypeScript Starter</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <SWRConfig
        value={{
          fetcher: (url: string) =>
            fetch(url).then((response) => response.json()),
        }}
      >
        <Component {...pageProps} />
      </SWRConfig>
    </>
  );
}

export default MyApp;
