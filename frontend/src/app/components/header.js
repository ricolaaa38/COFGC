"use client";

import Link from "next/link";
import styles from "./header.module.css";
import { usePathname } from "next/navigation";
import { useData } from "../context/DataContext";
import { useState } from "react";
const OAUTH2_URL = process.env.NEXT_PUBLIC_OAUTH2_URL;
const FRONT_URL = process.env.NEXT_PUBLIC_FRONT_URL;
const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL;

export default function Header() {
  const pathname = usePathname();
  const { userRole } = useData();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    const afterProxy =
      `${OAUTH2_URL}/oauth2/sign_out?rd=` + encodeURIComponent(`${FRONT_URL}`);
    const keycloakLogout =
      `${KEYCLOAK_URL}/realms/bqsm-realm/protocol/openid-connect/logout` +
      "?client_id=bqsm-client" +
      "&post_logout_redirect_uri=" +
      encodeURIComponent(afterProxy);
    window.location.href = keycloakLogout;
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("appViewRecorded");
      }
    } catch (err) {
      console.error("Erreur lors de la suppression de localStorage :", err);
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <h1>
        <Link href="/">
          <span className="material-symbols-outlined">public</span>
          <p>FMS COFGC</p>
        </Link>
      </h1>
      <button
        className={styles.menuButton}
        aria-expanded={menuOpen}
        aria-controls="main-nav"
        onClick={() => setMenuOpen((s) => !s)}
        title={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        <span className="material-symbols-outlined">
          {menuOpen ? "close" : "menu"}
        </span>
      </button>
      <nav
        id="main-nav"
        className={menuOpen ? styles.MenuOpen : styles.MenuClosed}
      >
        <div>
          <Link
            href="/"
            className={pathname === "/" ? styles.active : ""}
            onClick={closeMenu}
          >
            <span className="material-symbols-outlined">home</span>
            <p>Accueil</p>
          </Link>
        </div>
        <div>
          <Link
            href="/carte"
            className={pathname === "/carte" ? styles.active : ""}
            onClick={closeMenu}
          >
            <span className="material-symbols-outlined">map</span>
            <p>Carte</p>
          </Link>
        </div>
        <div>
          <Link
            href="/fiches"
            className={pathname === "/fiches" ? styles.active : ""}
            onClick={closeMenu}
          >
            <span className="material-symbols-outlined">folder_open</span>
            <p>{"Fiches d'analyse"}</p>
          </Link>
        </div>
        {userRole === "admin" && (
          <>
            <div>
              <Link
                href="/settings"
                title="settings"
                className={pathname === "/settings" ? styles.active : ""}
                onClick={closeMenu}
              >
                <span className="material-symbols-outlined">settings</span>
                <p>Paramètres</p>
              </Link>
            </div>
            <div>
              <Link
                href="/statistique"
                className={pathname === "/statistique" ? styles.active : ""}
              >
                <span className="material-symbols-outlined">query_stats</span>
                <p>Statistiques</p>
              </Link>
            </div>
          </>
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
