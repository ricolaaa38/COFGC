"use client";

import Header from "../components/header";
import Footer from "../components/footer";
import styles from "./page.module.css";
import Arborescence from "./arborescence";
import PdfViewer from "./pdfViewer";
import { useState } from "react";

export default function Fiches() {
  const [selectedFileForViewing, setSelectedFileForViewing] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div id={styles.fichesPage}>
      <Header />
      <button
        className={styles.menuButton}
        aria-expanded={drawerOpen}
        aria-controls="arboDrawer"
        onClick={() => setDrawerOpen((s) => !s)}
        title={drawerOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        <span className="material-symbols-outlined">
          {drawerOpen ? "close" : "menu"}
        </span>
      </button>

      <div
        className={`${styles.backdrop} ${
          drawerOpen ? styles.backdropVisible : ""
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />

      <div className={styles.bodyFichesAnalysePage}>
        <div
          id="arboDrawer"
          className={`${styles.arborescence} ${drawerOpen ? styles.open : ""}`}
        >
          <Arborescence
            setSelectedFileForViewing={(file) =>
              setSelectedFileForViewing(file)
            }
          />
        </div>
        <div className={styles.filesPdfViewerSection}>
          {selectedFileForViewing !== null ? (
            <PdfViewer fileUrl={selectedFileForViewing} />
          ) : (
            <p>Veuillez sélectionner un fichier à visualiser</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
