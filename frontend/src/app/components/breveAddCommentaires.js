"use client";

import { useState, useRef } from "react";
import Styles from "./breveAddCommentaires.module.css";
import { addCommentForBreve } from "../lib/db";
import { useData } from "../context/DataContext";
import useClickOutside from "../hook/useClickOutside";

export default function BreveAddCommentaires({
  breveId,
  setOpenCommentaireSection,
}) {
  const { setNeedRefresh } = useData();
  const [comment, setComment] = useState({
    redacteur: "",
    objet: "",
    commentaire: "",
  });
  const [message, setMessage] = useState("");
  const sectionRef = useRef(null);

  useClickOutside(sectionRef, () => setOpenCommentaireSection(false));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setComment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addCommentForBreve(breveId, comment);
    setComment({ redacteur: "", objet: "", commentaire: "" });
    setMessage("Commentaire ajouté avec succès !");
    setTimeout(() => setMessage(""), 2000);
    setNeedRefresh((prev) => !prev);
  };

  return (
    <div className={Styles.divSectionCommentaires} ref={sectionRef}>
      <div className={Styles.divCommentaireTitre}>
        <h2>Envoyer un commentaire</h2>
        <span
          className="material-symbols-outlined"
          onClick={() => setOpenCommentaireSection(false)}
        >
          close
        </span>
      </div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="redacteur">Email:</label>
        <input
          type="email"
          id="redacteur"
          name="redacteur"
          required
          value={comment.redacteur}
          onChange={handleChange}
        />
        <label htmlFor="objet">Objet:</label>
        <input
          type="text"
          id="objet"
          name="objet"
          required
          value={comment.objet}
          onChange={handleChange}
        />
        <label htmlFor="commentaire">Commentaire:</label>
        <textarea
          id="commentaire"
          name="commentaire"
          required
          value={comment.commentaire}
          onChange={handleChange}
        ></textarea>
        <button type="submit">Envoyer</button>
      </form>
      {message ? (
        <div className={Styles.successMessage}>{message}</div>
      ) : (
        <div className={Styles.emptyMessage}></div>
      )}
    </div>
  );
}
