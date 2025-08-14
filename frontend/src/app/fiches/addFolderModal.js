"use client";

import { useState } from "react";
import styles from "./addFolderModal.module.css";

export default function AddFolderModal({ defaultParent, onCreate, onClose }) {
  const [folderName, setFolderName] = useState("");
  const [selectedParent, setSelectedParent] = useState(defaultParent || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({ name: folderName, parentId: selectedParent.id || null });
  };
  return (
    <div className={styles.overlay}>
      <div className={styles.addFolderModal}>
        <h3>Créer un dossier dans {selectedParent.name}</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.labelInputGroup}>
            <label>Nom du dossier</label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              required
              placeholder="Entrez le nom du dossier"
            />
          </div>
          <div className={styles.modalButtons}>
            <button className={styles.confirmButton} type="submit">
              Créer
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
