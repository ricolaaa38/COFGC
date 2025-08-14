"use client";

import React from "react";
import styles from "./confirmationPopup.module.css";

export default function ConfirmationPopup({
  itemToDelete,
  onConfirm,
  onCancel,
}) {
  console.log(itemToDelete);
  return (
    <div className={styles.overlay}>
      <div className={styles.confirmationPopupSection}>
        {itemToDelete.file !== undefined ? (
          <h3>Supprimer le fichier {itemToDelete.name} ?</h3>
        ) : (
          <h3>Supprimer le dossier {itemToDelete.name} et son contenu ?</h3>
        )}
        <p>Cette action est irréversible</p>
        <div className={styles.confirmationButtons}>
          <button onClick={onConfirm} className={styles.confirmButton}>
            OUI
          </button>
          <button onClick={onCancel} className={styles.cancelButton}>
            NON
          </button>
        </div>
      </div>
    </div>
  );
}
