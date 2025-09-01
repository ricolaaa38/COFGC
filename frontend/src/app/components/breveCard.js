import { forwardRef, use, useEffect, useState } from "react";
import styles from "./breveCard.module.css";
import { getIconByCategorie } from "../lib/iconSelector";
import {
  getViewTrackerByBreveId,
  addAViewTrackerToBreve,
  userHaveAlreadyReadThisBreve,
  getAllIcons,
} from "../lib/db";
import { useData } from "../context/DataContext";

function BreveCard({ item, onOpenDetails, onFocusOnMap }, ref) {
  const [viewTracker, setViewTracker] = useState(0);
  const [hasUserRead, setHasUserRead] = useState(false);
  const { userEmail, needRefresh, setNeedRefresh } = useData();
  const [iconBase64, setIconBase64] = useState(null);

  useEffect(() => {
    const fetchViewTracker = async () => {
      const data = await getViewTrackerByBreveId(item.id);
      let view = 0;
      for (let i = 0; i < data.length; i++) {
        view = view + data[i].viewCount;
      }
      setViewTracker(view);
    };
    fetchViewTracker();
  }, [item.id, needRefresh]);

  const handleAddView = async () => {
    await addAViewTrackerToBreve(item.id, userEmail);
    setNeedRefresh(!needRefresh);
  };

  useEffect(() => {
    const checkUserReadStatus = async () => {
      const hasRead = await userHaveAlreadyReadThisBreve(item.id, userEmail);
      setHasUserRead(hasRead);
    };
    checkUserReadStatus();
  }, [item.id, needRefresh]);

  useEffect(() => {
    const fetchIcon = async () => {
      try {
        const icons = await getAllIcons();
        const found = icons.find(
          (icon) =>
            icon.iconName &&
            icon.iconName.toLowerCase() === item.categorie?.toLowerCase()
        );
        if (found) setIconBase64(found.base64 || found.icon);
        else setIconBase64(null);
      } catch (error) {
        console.error("Error fetching icons:", error);
      }
    };
    fetchIcon();
  }, [item.categorie, needRefresh]);

  return (
    <section
      className={
        hasUserRead
          ? `${styles.breveCardRead} ${styles.breveCard}`
          : styles.breveCard
      }
    >
      <div className={styles.breveCardBody}>
        <div className={styles.breveIcon}>
          {iconBase64 ? (
            <img
              src={`data:image/png;base64,${iconBase64}`}
              alt={item.categorie}
            />
          ) : (
            <span className="material-symbols-outlined">category</span>
          )}
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
          <div>
            <p>{item.zone}</p>
            <p className={styles.breveCardViews}>
              {viewTracker}
              <span className="material-symbols-outlined">visibility</span>
            </p>
          </div>
        </div>
      </div>
      <div className={styles.breveCardButton}>
        <button
          onClick={() => {
            onOpenDetails();
            // handleAddView();
          }}
        >
          <span className="material-symbols-outlined">visibility</span>
          <p>lire la breve</p>
        </button>
        <button onClick={onFocusOnMap}>
          <span className="material-symbols-outlined">location_on</span>
          <p>Voir sur la carte</p>
        </button>
      </div>
    </section>
  );
}

export default forwardRef(BreveCard);
