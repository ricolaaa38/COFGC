"use client";

import styles from "./filtreSection.module.css";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { useState, useEffect, useRef } from "react";
import { useData } from "../context/DataContext";

export default function FiltreSection() {
  const [dateRange, setDateRange] = useState([]);
  const [zone, setZone] = useState("");
  const [categorie, setCategorie] = useState("");
  const [intervenant, setIntervenant] = useState("");
  const [contributeur, setContributeur] = useState("");
  const [dateEvent, setDateEvent] = useState("");
  const flatpickrRef = useRef(null);
  const containerRef = useRef(null);
  const dateInputRef = useRef(null);

  const { filters, setActiveFilters } = useData();

  const filterCategories = [
    { id: "zone", label: "ZONE", state: zone, setState: setZone },
    {
      id: "categorie",
      label: "CATEGORIE",
      state: categorie,
      setState: setCategorie,
    },
    {
      id: "intervenant",
      label: "INTERVENANT",
      state: intervenant,
      setState: setIntervenant,
    },
    {
      id: "contributeur",
      label: "CONTRIBUTEUR",
      state: contributeur,
      setState: setContributeur,
    },
  ];

  function formatDateLocal(date) {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  useEffect(() => {
    setActiveFilters({
      zone,
      categorie,
      intervenant,
      contributeur,
      startDate: dateRange[0] ? formatDateLocal(dateRange[0]) : undefined,
      endDate: dateRange[1] ? formatDateLocal(dateRange[1]) : undefined,
      date: dateEvent ? formatDateLocal(new Date(dateEvent)) : undefined,
    });
  }, [zone, categorie, intervenant, contributeur, dateRange, dateEvent]);

  const resetFilter = () => {
    setDateRange([]);
    setZone("");
    setCategorie("");
    setIntervenant("");
    setContributeur("");
    setDateEvent("");
  };

  return (
    <section id={styles.filtreSection}>
      <span
        className="material-symbols-outlined"
        onClick={resetFilter}
        title="reset filter"
      >
        refresh
      </span>

      <div
        ref={containerRef}
        className={styles.labelFilter}
        onClick={() => {
          setTimeout(() => flatpickrRef.current.flatpickr.open(), 0);
        }}
      >
        <p>BQSM</p>
        <Flatpickr
          ref={flatpickrRef}
          value={dateRange}
          options={{
            mode: "range",
            dateFormat: "d/m/Y",
            onClose: (selectedDates) => {
              setDateRange(selectedDates);
            },
          }}
        />
      </div>
      <div
        className={styles.dateFilter}
        onClick={() => {
          if (dateInputRef.current) {
            dateInputRef.current.showPicker?.();
            dateInputRef.current.focus();
          }
        }}
      >
        <label htmlFor="date" onClick={(e) => e.stopPropagation()}>
          DATE
        </label>
        <input
          ref={dateInputRef}
          type="date"
          id="date"
          onChange={(e) => setDateEvent(e.target.value)}
          value={dateEvent}
        />
      </div>
      {filterCategories.map((category) => (
        <select
          key={category.id}
          id={category.id}
          name={category.id}
          className={styles.selectFilter}
          onChange={(e) => category.setState(e.target.value)}
          value={category.state}
        >
          <option value="" disabled>
            {category.label}
          </option>
          <option value=""></option>
          {filters
            .filter((item) => item.categorie === category.id)
            .map((item, index) => (
              <option key={index + item.name} value={item.name}>
                {item.name}
              </option>
            ))}
        </select>
      ))}
    </section>
  );
}
