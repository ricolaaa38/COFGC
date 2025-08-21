"use client";

import { useEffect, useState } from "react";
import { useData } from "./context/DataContext";
import { createApplicationView } from "./lib/db";

const OAUTH2_URL = process.env.NEXT_PUBLIC_OAUTH2_URL;
const FRONT_URL = process.env.NEXT_PUBLIC_FRONT_URL;

export default function AuthGate({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const { setUserRole, setUserEmail } = useData();

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
          const data = await resp.json();
          setIsAuthenticated(true);
          setUserEmail(data.email);
          await createApplicationView(data.email);

          if (data.roles && data.roles.length > 0) {
            setUserRole(data.roles[0]);
          }
          // console.log("User role set to:", data);
          // const resp2 = await fetch(`${OAUTH2_URL}/api/auth/debug-auth`, {
          //   credentials: "include",
          // });
          // if (resp2.ok) {
          //   // const debugData = await resp2.json();
          //   // console.log("Debug auth data:", debugData);

          // }
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
  }, [setUserRole]);

  if (checking) {
    return <div>Authentification en cours...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="redirecting-message">
        Redirection vers l’authentification…
      </div>
    );
  }

  return children;
}
