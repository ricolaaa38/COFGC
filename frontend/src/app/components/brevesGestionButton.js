"use client";

import { useEffect, useRef, useState } from "react";
import { addNewBrevesFromFile } from "../lib/db";
import styles from "./brevesGestionButton.module.css";
import { useData } from "../context/DataContext";
import { exportBreves } from "./exportBreves";

export default function BrevesGestionButtons() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isValidFile, setIsValidFile] = useState(false);
  const fileInputRef = useRef(null);
  const uploadSectionRef = useRef(null);
  const importButtonRef = useRef(null);
  const { brevesForExport, userRole, setNeedRefresh } = useData();

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      const target = e.target;
      if (
        (uploadSectionRef.current &&
          uploadSectionRef.current.contains(target)) ||
        (importButtonRef.current && importButtonRef.current.contains(target))
      ) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [isOpen]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      setMessage("Veuillez sélectionner un fichier.");
      setIsValidFile(false);
      setTimeout(() => {
        setMessage("");
      }, 2000);
      return;
    }
    if (!selectedFile.name.endsWith(".docx")) {
      setMessage("Erreur : Le fichier doit être au format .docx");
      setFile(null);
      setIsValidFile(false);
      setTimeout(() => {
        setMessage("");
      }, 2000);
      return;
    }
    setFile(selectedFile);
    setIsValidFile(true);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Veuillez sélectionner un fichier.");
      setTimeout(() => {
        setMessage("");
      }, 2000);
      return;
    }
    try {
      const data = await addNewBrevesFromFile(file);
      setMessage(data);
      setNeedRefresh((prev) => !prev);
      setTimeout(() => {
        setMessage("");
        setIsOpen(false);
        setFile(null);
        setIsValidFile(false);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 1000);
    } catch (error) {
      setMessage("Erreur lors de l'envoi du fichier.");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  return (
    <section className={styles.brevesGestionButtonSection}>
      {userRole === "admin" && (
        <button
          className={styles.importButton}
          ref={importButtonRef}
          onClick={() => setIsOpen(!isOpen)}
        >
          <p>IMPORTER</p>
          <span className="material-symbols-outlined">keyboard_arrow_down</span>
        </button>
      )}
      <button
        className={styles.exportButton}
        onClick={() => exportBreves(brevesForExport)}
      >
        <p>EXPORTER</p>
        <span className="material-symbols-outlined">keyboard_arrow_down</span>
      </button>
      {userRole === "admin" && (
        <button className={styles.diffuserButton}>
          <p>DIFFUSER</p>
          <span className="material-symbols-outlined">keyboard_arrow_down</span>
        </button>
      )}
      {isOpen && (
        <div className={styles.uploadSection} ref={uploadSectionRef}>
          <label htmlFor="file">Sélectionnez une brève :</label>
          <input
            id="file"
            name="file"
            type="file"
            accept=".docx"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <p>Format accepté : .docx</p>
          <button onClick={handleUpload} disabled={!isValidFile}>
            Envoyer
          </button>
          {message && <p>{message}</p>}
        </div>
      )}
    </section>
  );
}
