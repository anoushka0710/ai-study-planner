// pages/_app.tsx
import type { AppProps } from "next/app";
import { AuthProvider } from "@/context/AuthContext";  
import { Quicksand } from "next/font/google";
import "../styles/globals.css";
const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <main className={quicksand.className}>
        <Component {...pageProps} />
      </main>
    </AuthProvider>
  );
}