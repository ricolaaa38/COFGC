"use client";

import Link from "next/link";
import styles from "./header.module.css";
import { usePathname } from "next/navigation";
import { useData } from "../context/DataContext";
const OAUTH2_URL = process.env.NEXT_PUBLIC_OAUTH2_URL;
const FRONT_URL = process.env.NEXT_PUBLIC_FRONT_URL;
const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL;

export default function Header() {
  const pathname = usePathname();
  const { userRole } = useData();

  const handleLogout = () => {
    const afterProxy =
      `${OAUTH2_URL}/oauth2/sign_out?rd=` + encodeURIComponent(`${FRONT_URL}`);
    const keycloakLogout =
      `${KEYCLOAK_URL}/realms/bqsm-realm/protocol/openid-connect/logout` +
      "?client_id=bqsm-client" +
      "&post_logout_redirect_uri=" +
      encodeURIComponent(afterProxy);
    window.location.href = keycloakLogout;
  };

  return (
    <header id={styles.header}>
      <h1>
        <Link href="/">
          <span className="material-symbols-outlined">public</span>
          <p>FMS COFGC</p>
        </Link>
      </h1>
      <nav>
        <div>
          <Link href="/" className={pathname === "/" ? styles.active : ""}>
            <span className="material-symbols-outlined">home</span>
            <p>Accueil</p>
          </Link>
        </div>
        {/* <div>
          <Link
            href="/profil"
            className={pathname === "/profil" ? styles.active : ""}
          >
            <span className="material-symbols-outlined">person</span>
            <p>Profil</p>
          </Link>
        </div> */}
        <div>
          <Link
            href="/carte"
            className={pathname === "/carte" ? styles.active : ""}
          >
            <span className="material-symbols-outlined">map</span>
            <p>Carte</p>
          </Link>
        </div>
        <div>
          <Link
            href="/fiches"
            className={pathname === "/fiches" ? styles.active : ""}
          >
            <span className="material-symbols-outlined">folder_open</span>
            <p>{"Fiches d'analyse"}</p>
          </Link>
        </div>
        {userRole === "admin" && (
          <div>
            <Link
              href="/settings"
              title="settings"
              className={pathname === "/settings" ? styles.active : ""}
            >
              <span className="material-symbols-outlined">settings</span>
            </Link>
          </div>
        )}
        <div>
          <button onClick={handleLogout} title="Déconnexion">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
