import { forwardRef, useState } from "react";
import styles from "./breveCard.module.css";
import { getIconByCategorie } from "../lib/iconSelector";

function BreveCard({ item, onOpenDetails, onFocusOnMap }, ref) {
  return (
    <section className={styles.breveCard}>
      <div className={styles.breveCardBody}>
        <div className={styles.breveIcon}>
          <span className="material-symbols-outlined">
            {getIconByCategorie(item.categorie)}
          </span>
        </div>
        <div ref={ref} className={styles.breveInfo}>
          <div>
            <p>BQSM - {item.bqsmNumb}</p>
            <p>{item.date.slice(0, 10)}</p>
          </div>
          <p>{item.categorie}</p>
          <p>
            <strong>{item.titre}</strong>
          </p>
          <p>{item.zone}</p>
        </div>
      </div>
      <div className={styles.breveCardButton}>
        <button onClick={onOpenDetails}>
          <span className="material-symbols-outlined">visibility</span>lire la
          breve
        </button>
        <button onClick={onFocusOnMap}>
          <span className="material-symbols-outlined">location_on</span>Voir sur
          la carte
        </button>
      </div>
    </section>
  );
}

export default forwardRef(BreveCard);
