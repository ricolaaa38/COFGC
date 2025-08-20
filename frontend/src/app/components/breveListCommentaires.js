"use client";

import Styles from "./breveListCommentaires.module.css";
import { useData } from "../context/DataContext";
import { deleteComment } from "../lib/db";
import { useRef } from "react";
import useClickOutside from "../hook/useClickOutside";

export default function BreveListCommentaires({
  setOpenListCommentaires,
  commentaires,
}) {
  const { setNeedRefresh, userRole } = useData();
  const sectionRef = useRef(null);

  useClickOutside(sectionRef, () => setOpenListCommentaires(false));

  const handleDeleteComment = async (commentId) => {
    await deleteComment(commentId);
    setNeedRefresh((prev) => !prev);
  };

  return (
    <section className={Styles.sectionBreveListCommentaires} ref={sectionRef}>
      <div className={Styles.divCommentaireTitre}>
        <h2>Commentaires :</h2>
        <span
          className="material-symbols-outlined"
          onClick={() => setOpenListCommentaires(false)}
        >
          close
        </span>
      </div>
      <div className={Styles.listCommentaires}>
        {commentaires.length > 0 ? (
          commentaires.map((commentaire, index) => (
            <div key={index} className={Styles.commentaire}>
              <div className={Styles.commentaireRow}>
                <h4>Ajouté le :</h4>
                <p>{commentaire.date}</p>
              </div>
              <div className={Styles.commentaireRow}>
                <h4>Rédacteur :</h4>
                <p>{commentaire.redacteur}</p>
              </div>
              <div className={Styles.commentaireRow}>
                <h4>Objet :</h4>
                <p>{commentaire.objet}</p>
              </div>
              <div className={Styles.commentaireRowCommentaire}>
                <h4>Commentaire :</h4>
                <p>{commentaire.commentaire}</p>
              </div>
              {userRole === "admin" && (
                <span
                  className="material-symbols-outlined"
                  onClick={() => handleDeleteComment(commentaire.id)}
                >
                  delete
                </span>
              )}
            </div>
          ))
        ) : (
          <p>Aucun commentaire pour le moment.</p>
        )}
      </div>
    </section>
  );
}
