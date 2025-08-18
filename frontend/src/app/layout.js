"use client";

import { Roboto } from "next/font/google";
import { DataProvider } from "./context/DataContext";
import "./globals.css";
import AuthGate from "./AuthGate";

const roboto = Roboto({ subsets: ["latin"], variable: "--font-roboto" });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className={roboto.className}>
        <DataProvider>
          <AuthGate>{children}</AuthGate>
        </DataProvider>
      </body>
    </html>
  );
}
