"use client";

import styles from "./breveSection.module.css";
import { useData } from "../context/DataContext";
import { useCallback, useRef, useState, useEffect } from "react";
import BreveCard from "./breveCard";
import BreveDetails from "./breveDetails";
import { getBreveById, getFilteredBrevesForExport } from "../lib/db";
import AddANewBreveSection from "./addANewBreve";

export default function BreveSection({
  selectedBreveId,
  setSelectedBreveId,
  setFocusedBreve,
  resetMapView,
}) {
  const { breves, loadMoreBreves, hasMore, activeFilters, userRole } =
    useData();
  const observer = useRef();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedBreve, setSelectedBreve] = useState(null);
  const [openAddBreve, setOpenAddBreve] = useState(false);

  const lastBreveRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreBreves();
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, loadMoreBreves]
  );

  const onPrev = () => setSelectedIndex((i) => (i > 0 ? i - 1 : i));
  const onNext = () =>
    setSelectedIndex((i) => (i < breves.content.length - 1 ? i + 1 : i));
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < breves.content.length - 1;

  const handleOpenDetails = (index) => {
    setSelectedIndex(index);
    const breve = breves.content[index];
    if (breve) setFocusedBreve(breve);
  };
  useEffect(() => {
    if (selectedBreveId != null) {
      getBreveById(selectedBreveId).then((breve) => {
        if (breve && breve.id) setSelectedBreve(breve);
      });
      if (breves.content && breves.content.length > 0) {
        const idx = breves.content.findIndex((b) => b.id === selectedBreveId);
        if (idx !== -1) setSelectedIndex(idx);
      }
    }
  }, [selectedBreveId, breves.content]);

  useEffect(() => {
    if (selectedIndex != null && breves.content[selectedIndex]) {
      setFocusedBreve(breves.content[selectedIndex]);
    } else if (selectedBreve) {
      setFocusedBreve(selectedBreve);
    }
  }, [selectedIndex, selectedBreve, breves.content, setFocusedBreve]);

  // Quand la modale se ferme, reset aussi selectedBreveId
  const handleCloseDetails = () => {
    setSelectedIndex(null);
    setSelectedBreveId(null);
    setSelectedBreve(null);
    setFocusedBreve(null);
    if (resetMapView) resetMapView();
  };
  const handleCloseAddNewBreve = () => {
    setOpenAddBreve(false);
  };

  const activeFiltersArray = Object.entries(activeFilters)
    .filter(([key, value]) => value && value.trim() !== "")
    .map(([key, value]) => {
      const isDate = /^\d{4}-\d{2}-\d{2}/.test(value);
      return { key, value: isDate ? value.slice(0, 10) : value };
    });

  return (
    <section
      id={styles.breveSection}
      className={selectedIndex !== null ? styles.breveSectionNoScroll : ""}
    >
      <div className={styles.breveSectionTitle}>
        <h2>Résumé des brèves</h2>
        <p className={styles.nombreBreves}>{breves.totalElements} breves</p>
        <h3 className={styles.filtresTitle}>Filtres :</h3>
        {activeFiltersArray.length > 0 ? (
          <ul className={styles.activeFiltersList}>
            {activeFiltersArray.map(({ key, value }, index) => (
              <li key={index} className={styles.activeFilterItem}>
                <h4 className={styles.filterName}>{key}</h4>
                <p className={styles.filterValue}>{value}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun</p>
        )}
        <div className={styles.breveSectionActions}>
          {userRole === "admin" && (
            <span
              onClick={() => setOpenAddBreve(!openAddBreve)}
              className="material-symbols-outlined"
              title="Ajouter une brève"
            >
              add
            </span>
          )}
          <span
            onClick={handleCloseDetails}
            className="material-symbols-outlined"
            title="Recentrer la carte"
          >
            restart_alt
          </span>
        </div>
      </div>
      <div className={styles.brevesCards}>
        {breves.content?.map((item, index) => {
          const isLast = index === breves.content.length - 1;
          return (
            <BreveCard
              key={`${index}.${item.id}`}
              item={item}
              onOpenDetails={() => handleOpenDetails(index)}
              onFocusOnMap={() => setFocusedBreve(item)}
              ref={isLast ? lastBreveRef : undefined}
            />
          );
        })}
      </div>
      {(selectedBreve || selectedIndex !== null) && (
        <BreveDetails
          breve={
            selectedBreve || (breves.content && breves.content[selectedIndex])
          }
          closeBreveDetails={handleCloseDetails}
          onPrev={onPrev}
          onNext={onNext}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      )}
      {openAddBreve && (
        <AddANewBreveSection handleClose={handleCloseAddNewBreve} />
      )}
    </section>
  );
}
