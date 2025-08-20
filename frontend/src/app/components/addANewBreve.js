"use client";

import { useState } from "react";
import { useData } from "../context/DataContext";
import { addNewBreve } from "../lib/db";
import styles from "./addANewBreve.module.css";
import { getNames } from "country-list";

export default function AddANewBreveSection({ handleClose }) {
  const countryNames = getNames();
  const { setNeedRefresh, filters } = useData();
  const [message, setMessage] = useState("");
  const [breveInfo, setBreveInfo] = useState({
    bqsmNumb: "",
    categorie: "",
    contenu: "",
    date: "",
    id: "",
    latitude: "",
    longitude: "",
    pays: "",
    titre: "",
    zone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBreveInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBreveSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await addNewBreve(breveInfo);
      if (result) {
        setNeedRefresh((prev) => !prev);
        setMessage("Brève ajoutée avec succès !");
        setTimeout(() => {
          setMessage("");
          handleClose();
        }, 2000);
      } else {
        console.error("L'ajout de la brève a échoué !!!");
        setMessage("Erreur lors de l'ajout de la brève. Veuillez réessayer.");
        setTimeout(() => {
          setMessage("");
        }, 2000);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la brève !!!", error.message);
      setMessage("Erreur lors de l'ajout de la brève : " + error.message);
      setTimeout(() => {
        setMessage("");
      }, 2000);
    }
  };

  return (
    <section className={styles.addBreveSection}>
      <div className={styles.addBreveDiv}>
        <div className={styles.addBreveTitle}>
          <h2>Ajouter une nouvelle brève</h2>
          <span
            onClick={handleClose}
            className="material-symbols-outlined"
            title="Fermer"
          >
            close
          </span>
        </div>
        <form onSubmit={handleBreveSubmit}>
          <div className={styles.formRow}>
            <label htmlFor="bqsmNumb">Numéro BQSM</label>
            <input
              type="date"
              name="bqsmNumb"
              value={breveInfo.bqsmNumb.slice(0, 10)}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="date">Date</label>
            <input
              type="date"
              name="date"
              value={breveInfo.date.slice(0, 10)}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="titre">Titre</label>
            <input
              type="text"
              name="titre"
              value={breveInfo.titre}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="categorie">Catégorie</label>
            <select
              name="categorie"
              value={breveInfo.categorie}
              onChange={handleChange}
              required
            >
              <option value="">-- Choisir une catégorie --</option>
              {filters
                .filter((liste) => liste.categorie === "categorie")
                .map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>
          <div className={styles.formRow}>
            <label htmlFor="zone">Zone</label>
            <select
              name="zone"
              value={breveInfo.zone}
              onChange={handleChange}
              required
            >
              <option value="">-- Choisir une zone --</option>
              {filters
                .filter((liste) => liste.categorie === "zone")
                .map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>
          <div className={styles.formRow}>
            <label htmlFor="pays">Pays</label>
            <select
              name="pays"
              value={breveInfo.pays}
              onChange={handleChange}
              required
            >
              <option value="">-- Sélectionner un pays --</option>
              {countryNames.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formRow}>
            <label htmlFor="latitude">Latitude</label>
            <input
              type="number"
              name="latitude"
              value={breveInfo.latitude}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="longitude">Longitude</label>
            <input
              type="number"
              name="longitude"
              value={breveInfo.longitude}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formTextarea}>
            <label htmlFor="contenu">Compte-rendu</label>
            <textarea
              name="contenu"
              value={breveInfo.contenu}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Enregistrer</button>
        </form>
        <p className={styles.message}>{message}</p>
      </div>
    </section>
  );
}
