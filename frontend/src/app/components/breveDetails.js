"use client";

import { useEffect, useState } from "react";
import { useData } from "../context/DataContext";
import {
  getContributeursByBreveId,
  getIntervenantsByBreveId,
  getPicturesByBreveId,
  getAllLinksByBreveId,
  getCommentsByBreveId,
  getBreveAssociateIcons,
  addAViewTrackerToBreve,
  getAllIcons,
} from "../lib/db";
import { getIconByCategorie } from "../lib/iconSelector";
import UpdateBreveSection from "./updateBreve";
import styles from "./breveDetails.module.css";
import BreveAddCommentaires from "./breveAddCommentaires";
import BreveListCommentaires from "./breveListCommentaires";
import ConfirmDeleteBrevePopup from "./popupDeleteBreve";

export default function BreveDetails({
  breve,
  closeBreveDetails,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) {
  const { userRole, needRefresh, setNeedRefresh, userEmail } = useData();
  const [pictures, setPictures] = useState([]);
  const [current, setCurrent] = useState(0);
  const [intervenants, setIntervenants] = useState([]);
  const [contributeurs, setContributeurs] = useState([]);
  const [commentaires, setCommentaires] = useState([]);
  const [openUpdateBreve, setOpenUpdateBreve] = useState(false);
  const [openCommentaireSection, setOpenCommentaireSection] = useState(false);
  const [openListCommentaires, setOpenListCommentaires] = useState(false);
  const [links, setLinks] = useState([]);
  const [associatedIcons, setAssociatedIcons] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openPopupDeleteBreve, setOpenPopupDeleteBreve] = useState(false);
  const [iconBase64, setIconBase64] = useState(null);

  useEffect(() => {
    async function fetchIcons() {
      if (isDeleting) return;
      try {
        const icons = await getBreveAssociateIcons(breve.id);
        setAssociatedIcons(icons);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des icônes associées :",
          error
        );
      }
    }
    fetchIcons();
  }, [breve.id, needRefresh]);

  function nextPic() {
    setCurrent((c) => (c < pictures.length - 1 ? c + 1 : 0));
  }
  function prevPic() {
    setCurrent((c) => (c > 0 ? c - 1 : pictures.length - 1));
  }

  useEffect(() => {
    if (isDeleting) return;
    if (breve?.id) {
      // setPictures([]);
      // setLinks([]);
      // setIntervenants([]);
      // setContributeurs([]);
      // setCommentaires([]);
      getIntervenantsByBreveId(breve.id).then(setIntervenants);
      getContributeursByBreveId(breve.id).then(setContributeurs);
      getPicturesByBreveId(breve.id).then(setPictures);
      getAllLinksByBreveId(breve.id).then(setLinks);
      getCommentsByBreveId(breve.id).then(setCommentaires);
      setCurrent(0);
    }
  }, [breve, needRefresh]);

  useEffect(() => {
    const fetchIcon = async () => {
      try {
        const icons = await getAllIcons();
        const found = icons.find(
          (icon) =>
            icon.iconName &&
            icon.iconName.toLowerCase() === breve.categorie?.toLowerCase()
        );
        if (found) setIconBase64(found.base64 || found.icon);
        else setIconBase64(null);
      } catch (error) {
        console.error("Error fetching icons:", error);
      }
    };
    fetchIcon();
  }, [breve.categorie, needRefresh]);

  if (!breve) return null;

  useEffect(() => {
    if (isDeleting) return;
    if (!breve?.id) return;
    if (typeof window === "undefined") return;

    window.__lastBreveViewTimestamp = window.__lastBreveViewTimestamp || {};
    const now = Date.now();
    const last = window.__lastBreveViewTimestamp[breve.id] || 0;
    const THROTTLE_MS = 2000;
    if (now - last < THROTTLE_MS) return;

    window.__lastBreveViewTimestamp[breve.id] = now;

    addAViewTrackerToBreve(breve.id, userEmail)
      .then(() => setNeedRefresh((s) => !s))
      .catch((err) => {
        console.error("Erreur ajout vue :", err);
        delete window.__lastBreveViewTimestamp[breve.id];
      });
  }, [breve.id, userEmail, setNeedRefresh]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalNav}>
          <div>
            <button
              onClick={() => {
                onPrev();
              }}
              disabled={!hasPrev}
              title="précédent"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button
              onClick={() => {
                onNext();
              }}
              disabled={!hasNext}
              title="suivant"
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
          {userRole === "admin" ? (
            <>
              <button
                className={styles.breveButtonUpdate}
                title="modifier"
                onClick={() => setOpenUpdateBreve(!openUpdateBreve)}
              >
                <span className="material-symbols-outlined">edit_square</span>
              </button>
              <button
                className={styles.breveButtonAdd}
                title="ajouter un commentaire"
                onClick={() => {
                  setOpenCommentaireSection(!openCommentaireSection);
                  setOpenListCommentaires(false);
                }}
              >
                <span className="material-symbols-outlined">comment</span>
              </button>
              <button
                className={styles.breveButtonDelete}
                title="supprimer"
                onClick={() => setOpenPopupDeleteBreve((prev) => !prev)}
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </>
          ) : (
            <button
              title="ajouter un commentaire"
              onClick={() => {
                setOpenCommentaireSection(!openCommentaireSection);
                setOpenListCommentaires(false);
              }}
            >
              <span className="material-symbols-outlined">comment</span>
            </button>
          )}

          <button onClick={closeBreveDetails} title="fermer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className={styles.breveCardHeader}>
          <div className={styles.breveIcon}>
            {iconBase64 ? (
              <img
                src={`data:image/png;base64,${iconBase64}`}
                alt={breve.categorie}
              />
            ) : (
              <span className="material-symbols-outlined">category</span>
            )}
          </div>
          <div className={styles.breveInfo}>
            <div>
              <h3>BQSM - {breve.bqsmNumb}</h3>
              <p>{breve.date.slice(0, 10)}</p>
            </div>
            <p>{breve.categorie}</p>
            <p>
              <strong>{breve.titre}</strong>
            </p>
            <p>{breve.zone}</p>
          </div>
          {userRole === "admin" && (
            <button
              className={styles.breveComments}
              onClick={() => {
                setOpenListCommentaires(!openListCommentaires);
                setOpenCommentaireSection(false);
              }}
            >
              {commentaires.length}
              <span className="material-symbols-outlined">comment</span>
            </button>
          )}
        </div>
        <div className={styles.breveCarroussel}>
          {pictures.length > 0 ? (
            <div>
              <button
                className={styles.previousPictureButton}
                onClick={prevPic}
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <img
                src={`data:image/jpeg;base64,${pictures[current].base64}`}
                alt={pictures[current].name || "photo"}
              />
              <button className={styles.nextPictureButton} onClick={nextPic}>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <div className={styles.carouselDots}>
                {pictures.map((_, idx) => (
                  <span
                    key={idx}
                    className={`${styles.dot} ${
                      current === idx ? styles.activeDot : ""
                    }`}
                    onClick={() => setCurrent(idx)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p>Veuillez ajouter des images !</p>
          )}
        </div>
        <div className={styles.breveBody}>
          <p className={styles.breveBodyContent}>{breve.contenu}</p>

          <div className={styles.breveBodyLink}>
            <p>Liens associés :</p>
            {links.length > 0 ? (
              links.map((link, index) =>
                link.typeLink === "file" ? (
                  <a
                    key={index}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(
                        `/fiches?fileId=${link.link.split("/").pop()}`
                      );
                    }}
                    title={`Ouvrir le document ${link.name}`}
                  >
                    <span className="material-symbols-outlined">link</span>
                    {link.name}
                  </a>
                ) : (
                  <a
                    key={index}
                    href={link.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`lien vers ${link.name}`}
                  >
                    <span className="material-symbols-outlined">link</span>
                    {link.name}
                  </a>
                )
              )
            ) : (
              <p>Aucun lien disponible</p>
            )}
          </div>
        </div>
        <div className={styles.breveIntervenantsBody}>
          <h3>Intervenants</h3>
          <div className={styles.breveIntervenants}>
            {associatedIcons.length > 0 ? (
              associatedIcons
                .filter((item) => item.intervenantId !== null)
                .map((item, index) => (
                  <p
                    className={styles.intervenantLogo}
                    key={item.intervenantId + item.id + index}
                  >
                    <img
                      src={`data:image/png;base64,${item.iconId.icon}`}
                      alt={item.iconId.iconName}
                      title={item.iconId.iconName}
                      width={90}
                      height={90}
                    />
                  </p>
                ))
            ) : (
              <p>Veuillez ajouter des intervenants !</p>
            )}
          </div>
        </div>
        <div className={styles.breveContributeursBody}>
          <h3>Contributeurs</h3>
          <div className={styles.breveContributeurs}>
            {associatedIcons.length > 0 ? (
              associatedIcons
                .filter((item) => item.contributeurId !== null)
                .map((item, index) => (
                  <p
                    className={styles.contributeurLogo}
                    key={item.contributeurId + item.id + index}
                  >
                    <img
                      src={`data:image/png;base64,${item.iconId.icon}`}
                      alt={item.iconId.iconName}
                      title={item.iconId.iconName}
                      width={90}
                      height={90}
                    />
                  </p>
                ))
            ) : (
              <p>Veuillez ajouter des contributeurs !</p>
            )}
          </div>
        </div>
      </div>
      {openUpdateBreve && (
        <div className={styles.updateBreveModalContent}>
          <div className={styles.updateBreveHeader}>
            <button onClick={() => setOpenUpdateBreve(!openUpdateBreve)}>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h3>Modifier BQSM - {breve.bqsmNumb}</h3>
            <button onClick={closeBreveDetails} title="fermer">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className={styles.updateBreveSection}>
            <UpdateBreveSection
              brevePreviousInfo={breve}
              previousPictures={pictures}
              previousLinks={links}
              associatedIcons={associatedIcons}
            />
          </div>
        </div>
      )}
      {openCommentaireSection && (
        <BreveAddCommentaires
          breveId={breve.id}
          setOpenCommentaireSection={setOpenCommentaireSection}
        />
      )}
      {openListCommentaires && (
        <BreveListCommentaires
          setOpenListCommentaires={setOpenListCommentaires}
          commentaires={commentaires}
        />
      )}
      {openPopupDeleteBreve && (
        <ConfirmDeleteBrevePopup
          breveId={breve.id}
          closeBreveDetails={closeBreveDetails}
          setIsDeleting={setIsDeleting}
          setOpenPopupDeleteBreve={setOpenPopupDeleteBreve}
        />
      )}
    </div>
  );
}
