"use client";
import { useState } from "react";
import styles from "./addFileModal.module.css";

export default function AddFileModal({ defaultParent, onCreate, onClose }) {
  const [fileName, setFileName] = useState("");
  const [selectedParent, setSelectedParent] = useState(defaultParent || "");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    onCreate({
      name: fileName,
      parentId: selectedParent.id || null,
      file: selectedFile,
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.addFileModal}>
        <h3>Ajouter un fichier PDF dans {selectedParent.name}</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.labelInputGroup}>
            <label>Nom du fichier</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Entrez le nom du fichier"
              required
            />
          </div>
          <div className={styles.labelInputGroup}>
            <label>Fichier</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              required
            />
          </div>
          <div className={styles.modalButtons}>
            <button className={styles.confirmButton} type="submit">
              Ajouter
            </button>
            <button
              className={styles.cancelButton}
              type="button"
              onClick={onClose}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
