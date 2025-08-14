"use client";

import { useEffect, useState } from "react";
import Footer from "../components/footer";
import Header from "../components/header";
import { useData } from "../context/DataContext";
import { addFiltres } from "../lib/db";
import {
  updateFiltres,
  deleteFiltres,
  getAllIcons,
  addIcon,
  deleteIcon,
} from "../lib/db";
import styles from "./page.module.css";

export default function SettingsPage() {
  const { filters, setNeedRefresh, needRefresh } = useData();
  const [isActive, setIsActive] = useState("");
  const categories = Array.from(new Set(filters.map((item) => item.categorie)));
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showNewFilterForm, setShowNewFilterForm] = useState(false);
  const [showUpdateFilterBtn, setShowUpdateFilterBtn] = useState(false);
  const [showDeleteFilterBtn, setShowDeleteFilterBtn] = useState(false);
  const [menuState, setMenuState] = useState("closed");
  const [icons, setIcons] = useState([]);
  const [showDeleteIconBtn, setShowDeleteIconBtn] = useState(false);
  const [showNewIconForm, setShowNewIconForm] = useState(false);

  useEffect(() => {
    const fetchIcons = async () => {
      try {
        const iconsData = await getAllIcons();
        setIcons(iconsData || []);
      } catch (error) {
        console.error("Erreur lors de la récupération des icônes", error);
      }
    };
    fetchIcons();
  }, [needRefresh]);

  useEffect(() => {
    if (filters.length > 0 && !selectedCategory) {
      setSelectedCategory(filters[0].categorie);
      setIsActive(filters[0].categorie);
    }
  }, [filters, selectedCategory]);

  const toggleShowBtns = () => {
    if (menuState === "open") {
      setMenuState("closing");
      setTimeout(() => setMenuState("closed"), 400);
    } else {
      setMenuState("open");
    }
  };

  const openMenu = () => {
    if (menuState === "closed") {
      setMenuState("open");
    }
  };

  const closeMenu = () => {
    if (menuState === "open") {
      setMenuState("closing");
      setTimeout(() => {
        setMenuState("closed");
      }, 400);
    }
  };

  const handleAddFilter = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newFilter = {
      name: formData.get("name"),
      categorie: selectedCategory,
    };
    await addFiltres(newFilter);
    setNeedRefresh((prev) => !prev);
  };

  const handleAddIcon = async (e) => {
    e.preventDefault();
    const iconName = e.target.icon_name.value;
    const file = e.target.icon.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(",")[1];
      const iconData = {
        iconName: iconName,
        icon: base64String,
      };
      await addIcon(iconData);
      setShowNewIconForm(false);
      setNeedRefresh((prev) => !prev);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateFilter = async (e, filterId) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedFilter = {
      id: filterId,
      name: formData.get("name"),
      categorie: selectedCategory,
    };
    await updateFiltres(updatedFilter);
    setNeedRefresh((prev) => !prev);
  };

  const handleDeleteFilter = async (filterId) => {
    await deleteFiltres(filterId);
    setNeedRefresh((prev) => !prev);
  };

  const handleDeleteIcon = async (iconId) => {
    await deleteIcon(iconId);
    setNeedRefresh((prev) => !prev);
  };

  return (
    <section className={styles.settingsPage}>
      <Header />
      <div className={styles.settingsContains}>
        <h2>Paramètres</h2>
        <div className={styles.categoriesBtns}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setIsActive(cat);
                setShowNewFilterForm(false);
                setShowUpdateFilterBtn(false);
                setShowDeleteFilterBtn(false);
                setShowNewIconForm(false);
                setShowDeleteIconBtn(false);
              }}
              className={isActive === cat ? styles.active : ""}
            >
              {cat.toUpperCase()}
            </button>
          ))}
          <button
            onClick={() => {
              setSelectedCategory("icon");
              setIsActive("icon");
              setShowNewFilterForm(false);
              setShowUpdateFilterBtn(false);
              setShowDeleteFilterBtn(false);
              setShowNewIconForm(false);
              setShowDeleteIconBtn(false);
            }}
            className={isActive === "icon" ? styles.active : ""}
          >
            ICONS
          </button>
          <div className={styles.fabContainer}>
            <div
              className={styles.fabHoverZone}
              onClick={toggleShowBtns}
              onMouseEnter={openMenu}
              onMouseLeave={closeMenu}
            >
              <button className={`${styles.fabMain} ${styles[menuState]}`}>
                <span className="material-symbols-outlined">spoke</span>
              </button>

              {menuState !== "closed" && (
                <div className={`${styles.fabMenu} ${styles[menuState]}`}>
                  {selectedCategory !== "icon" ? (
                    <>
                      <button
                        className={styles.fabItem}
                        onClick={() => {
                          setShowNewFilterForm(!showNewFilterForm);
                          setShowUpdateFilterBtn(false);
                          setShowDeleteFilterBtn(false);
                        }}
                      >
                        <span className="material-symbols-outlined">add</span>
                      </button>
                      <button
                        className={styles.fabItem}
                        onClick={() => {
                          setShowUpdateFilterBtn(!showUpdateFilterBtn);
                          setShowNewFilterForm(false);
                          setShowDeleteFilterBtn(false);
                        }}
                      >
                        <span className="material-symbols-outlined">
                          autorenew
                        </span>
                      </button>
                      <button
                        className={styles.fabItem}
                        onClick={() => {
                          setShowUpdateFilterBtn(false);
                          setShowNewFilterForm(false);
                          setShowDeleteFilterBtn(!showDeleteFilterBtn);
                        }}
                      >
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className={styles.fabItem}
                        onClick={() => {
                          setShowNewIconForm(!showNewIconForm);
                          setShowDeleteIconBtn(false);
                        }}
                      >
                        <span className="material-symbols-outlined">add</span>
                      </button>
                      {/* <button
                        className={styles.fabItem}
                        onClick={() => {
                          setShowDeleteIconBtn(!showDeleteIconBtn);
                          setShowNewIconForm(false);
                        }}
                      >
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                      </button> */}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {selectedCategory !== "icon" ? (
          <ul className={styles.filtersList}>
            <li className={styles.spacer}></li>
            {filters
              .filter((item) => item.categorie === selectedCategory)
              .map((item) => (
                <li key={item.id} className={styles.filterItem}>
                  <span className={styles.nameWithDot}>{item.name}</span>
                  {showUpdateFilterBtn && (
                    <form
                      className={styles.updateForm}
                      onSubmit={(e) => handleUpdateFilter(e, item.id)}
                    >
                      <input
                        type="text"
                        name="name"
                        placeholder="nom du filtre"
                        required
                      />
                      <button type="submit">Modifier</button>
                    </form>
                  )}
                  {showDeleteFilterBtn && (
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteFilter(item.id)}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  )}
                </li>
              ))}
            {showNewFilterForm && (
              <li className={styles.newFilterForm}>
                <form onSubmit={handleAddFilter}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nom du filtre"
                    required
                  />
                  <button type="submit">Ajouter</button>
                </form>
              </li>
            )}
            <li className={styles.spacer}></li>
          </ul>
        ) : (
          <div className={styles.iconsList}>
            {icons.length > 0 ? (
              icons.map((icon) => (
                <div key={icon.id} className={styles.iconItem}>
                  <p>{icon.iconName.toUpperCase()}</p>
                  <img
                    src={`data:image/png;base64,${icon.base64}`}
                    alt={icon.iconName}
                  />

                  {/* {showDeleteIconBtn && (
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteIcon(icon.id)}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  )} */}
                </div>
              ))
            ) : (
              <p>Aucune icône trouvée.</p>
            )}
            {showNewIconForm && (
              <form className={styles.newIconForm} onSubmit={handleAddIcon}>
                <input
                  type="text"
                  name="icon_name"
                  placeholder="Nom de l'icône"
                  required
                />
                <input
                  type="file"
                  name="icon"
                  accept="image/png, image/jpeg"
                  required
                />
                <button type="submit">Ajouter</button>
              </form>
            )}
          </div>
        )}
      </div>
      <Footer />
    </section>
  );
}
