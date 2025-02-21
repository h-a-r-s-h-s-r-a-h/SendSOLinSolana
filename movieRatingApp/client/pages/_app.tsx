import React from "react";
import "./globals.css"; // ✅ Import global styles here
import type { AppProps } from "next/app";
import WalletContextProvider from "../components/WalletContextProvider";
import { AppBar } from "../components/AppBar";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-gray-900 text-white">
        <AppBar />
        <main className="container mx-auto px-4 py-6">
          <Component {...pageProps} />
        </main>
      </div>
    </WalletContextProvider>
  );
}

export default MyApp;
