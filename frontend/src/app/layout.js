"use client";

import { Roboto } from "next/font/google";
import { DataProvider } from "./context/DataContext";
import "./globals.css";
import { useEffect, useState } from "react";
const OAUTH2_URL = process.env.NEXT_PUBLIC_OAUTH2_URL;
const FRONT_URL = process.env.NEXT_PUBLIC_FRONT_URL;

const roboto = Roboto({ subsets: ["latin"], variable: "--font-roboto" });

export default function RootLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const resp = await fetch(`${OAUTH2_URL}/api/auth/`, {
          credentials: "include",
        });
        if (
          resp.status === 401 ||
          resp.status === 403 ||
          resp.status === 302 ||
          resp.redirected
        ) {
          window.location.href = `${OAUTH2_URL}/oauth2/start?rd=${FRONT_URL}`;
          return;
        }

        if (resp.ok) {
          setIsAuthenticated(true);
        } else {
          window.location.href = `${OAUTH2_URL}/oauth2/start?rd=${FRONT_URL}`;
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error("Erreur de vérification d'auth", e);
        window.location.href = `${OAUTH2_URL}/oauth2/start?rd=${FRONT_URL}`;
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (checking) {
    return (
      <html lang="en">
        <body>
          <div>Authentification en cours...</div>
        </body>
      </html>
    );
  }

  if (!isAuthenticated) {
    return (
      <html lang="en">
        <body>
          <div>Redirection vers l’authentification…</div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className={roboto.className}>
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
