// pages/_app.tsx
import type { AppProps } from "next/app";
import Head from "next/head";
import { AuthProvider } from "@/context/AuthContext";  
import { Quicksand } from "next/font/google";
import "../styles/globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Aurora</title>
      </Head>

      <AuthProvider>
        <main className={quicksand.className}>
          <Component {...pageProps} />
        </main>
      </AuthProvider>
    </>
  );
}
