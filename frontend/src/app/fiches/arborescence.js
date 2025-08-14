"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./arborescence.module.css";
import {
  getAllFolders,
  getFolderChildren,
  addNewDossier,
  addNewFile,
  deleteFile,
  deleteFolder,
  getOneFile,
  getFileMeta,
  getFolderMeta,
} from "../lib/db";
import AddFolderModal from "./addFolderModal";
import AddFileModal from "./addFileModal";
import ConfirmationPopup from "./confirmationPopup";
import { useData } from "../context/DataContext";

export default function Arborescence({ setSelectedFileForViewing }) {
  const { userRole } = useData();
  const [folders, setFolders] = useState([]);
  const [error, setError] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [loadingFolder, setLoadingFolder] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [defaultParent, setDefaultParent] = useState("");
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [addMode, setAddMode] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const searchParams = useSearchParams();
  const fileId = searchParams.get("fileId");

  useEffect(() => {
    async function fetchFileAndOpenFolders() {
      if (fileId) {
        try {
          // 1. Récupère le fichier pour avoir son parentId
          const fileMeta = await getFileMeta(Number(fileId)); // À créer : retourne { parentId, ... }
          let currentParentId = fileMeta.parentId;

          // 2. Ouvre tous les dossiers parents
          const parentIds = [];
          while (currentParentId) {
            parentIds.unshift(currentParentId); // On veut ouvrir du root vers le leaf
            const parentMeta = await getFolderMeta(currentParentId.id); // À créer : retourne { parentId, ... }
            currentParentId = parentMeta.parentId;
          }
          for (const id of parentIds) {
            const folderId = typeof id === "object" ? id.id : id;
            await toggleFolder(folderId); // Ouvre chaque dossier parent
          }
          // 3. Récupère et affiche le fichier
          const blob = await getOneFile(fileId);
          const fileUrl = URL.createObjectURL(blob);
          setSelectedFileForViewing(fileUrl);
        } catch (error) {
          console.error(
            "Erreur lors de la récupération du fichier PDF :",
            error
          );
        }
      }
    }
    fetchFileAndOpenFolders();
  }, [fileId]);

  // Fonction pour recharger l'arborescence complète
  const fetchFolders = async () => {
    try {
      const allFolders = await getAllFolders();
      setFolders(allFolders);
    } catch (err) {
      console.error("Erreur lors de la récupération des dossiers :", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  // Fonction pour fermer l'ensemble de la descendance d'un dossier
  const closeFolderAndDescendants = useCallback((folderId) => {
    setExpandedFolders((prev) => {
      const newState = { ...prev };
      const removeKeys = (id) => {
        if (newState[id] && newState[id] !== false && newState[id].folders) {
          for (const subFolder of newState[id].folders) {
            removeKeys(subFolder.id);
          }
        }
        delete newState[id];
      };
      removeKeys(folderId);
      return newState;
    });
  }, []);

  const toggleFolder = useCallback(
    async (folderId) => {
      if (loadingFolder === folderId) return;
      if (expandedFolders[folderId]) {
        closeFolderAndDescendants(folderId);
      } else {
        setLoadingFolder(folderId);
        try {
          const children = await getFolderChildren(folderId);
          setExpandedFolders((prev) => ({ ...prev, [folderId]: children }));
        } catch (err) {
          console.error("Erreur lors de la récupération des dossiers :", err);
          setError(err.message);
        } finally {
          setLoadingFolder(null);
        }
      }
    },
    [expandedFolders, loadingFolder, closeFolderAndDescendants]
  );

  // Ouvre la modal de confirmation et mémorise l'élément à supprimer
  const handleDeleteElement = (item) => {
    setItemToDelete(item);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (itemToDelete.file !== undefined) {
        await deleteFile(itemToDelete.id);
        console.log("Fichier supprimé :", itemToDelete.id);
      } else if (itemToDelete.parentId !== null) {
        await deleteFolder(itemToDelete.id);
        console.log("Dossier supprimé :", itemToDelete.id);
      }
      await fetchFolders();
      if (itemToDelete.parentId) {
        const parentId = itemToDelete.parentId.id;
        if (expandedFolders[parentId]) {
          const updatedChildren = await getFolderChildren(parentId);
          setExpandedFolders((prev) => ({
            ...prev,
            [parentId]: updatedChildren,
          }));
        }
      }
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      setError(err.message);
    } finally {
      setConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setItemToDelete(null);
  };

  const renderFolder = (folder) => {
    const hasChildren = expandedFolders[folder.id];
    const isLoading = loadingFolder === folder.id;
    return (
      <div key={folder.id} className={styles.folderItem}>
        <div
          onClick={() => toggleFolder(folder.id)}
          className={styles.folderName}
        >
          {hasChildren ? (
            <span className="material-symbols-outlined">folder_open</span>
          ) : (
            <span className="material-symbols-outlined">folder</span>
          )}
          {folder.name}
          {addMode === "folder" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDefaultParent(folder);
                setShowAddModal(true);
              }}
              className={styles.addFolderIcon}
              title="Ajouter un dossier enfant"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          )}
          {addMode === "file" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDefaultParent(folder);
                setShowAddFileModal(true);
              }}
              className={styles.addFileIcon}
              title="Ajouter un fichier enfant"
            >
              <span className="material-symbols-outlined">note_add</span>
            </button>
          )}
          {addMode === "delete" && folder.parentId !== null && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteElement(folder);
              }}
              className={styles.deleteIcon}
              title="Supprimer cet élément"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          )}
        </div>
        {hasChildren && (
          <div className={styles.children}>
            {isLoading ? (
              <span className="material-symbols-outlined">hourglass_top</span>
            ) : (
              <>
                {hasChildren.folders.map((childFolder) =>
                  renderFolder(childFolder)
                )}
                {hasChildren.files.map((file) => (
                  <div
                    key={file.id}
                    className={styles.childFile}
                    onClick={() => handleFileClick(file)}
                  >
                    <span className="material-symbols-outlined">
                      picture_as_pdf
                    </span>
                    {file.name}
                    {addMode === "delete" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteElement(file);
                        }}
                        className={styles.deleteIcon}
                        title="Supprimer cet élément"
                      >
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                      </button>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleCreateFolder = async ({ name, parentId }) => {
    try {
      const folderData = { name, parentId: parentId ? Number(parentId) : null };
      await addNewDossier(folderData);
      if (parentId) {
        const updatedChildren = await getFolderChildren(Number(parentId));
        setExpandedFolders((prev) => ({
          ...prev,
          [parentId]: updatedChildren,
        }));
      } else {
        await fetchFolders();
      }
      setShowAddModal(false);
    } catch (err) {
      console.error("Erreur lors de la création du dossier :", err);
      setError(err.message);
    }
  };

  const handleCreateFile = async ({ name, parentId, file }) => {
    try {
      const numericParentId = parentId ? Number(parentId) : null;
      await addNewFile(numericParentId, name, file);
      if (parentId) {
        const updatedChildren = await getFolderChildren(Number(parentId));
        setExpandedFolders((prev) => ({
          ...prev,
          [parentId]: updatedChildren,
        }));
      } else {
        await fetchFolders();
      }
      setShowAddFileModal(false);
    } catch (err) {
      console.error("Erreur lors de la création du fichier :", err);
      setError(err.message);
    }
  };

  const handleFileClick = async (file) => {
    try {
      const blob = await getOneFile(file.id);
      const fileUrl = URL.createObjectURL(blob);
      setSelectedFileForViewing(fileUrl);
      console.log("response", fileUrl);
    } catch (error) {
      console.error("Erreur lors de la récupération du fichier PDF :", error);
    }
  };

  return (
    <section className={styles.filesArborescenceSection}>
      <div className={styles.arborescenceHeader}>
        <h2>{"Fiches d'analyse"}</h2>
        {userRole === "admin" && (
          <div className={styles.settingsContainer}>
            <span
              className="material-symbols-outlined"
              onClick={() =>
                setShowSettingsDropdown((prev) => !prev, setAddMode(""))
              }
              title="Options d'ajout"
            >
              settings
            </span>
            {showSettingsDropdown && (
              <div className={styles.settingsDropdown}>
                <button
                  onClick={() =>
                    setAddMode(
                      addMode === "" ||
                        addMode === "file" ||
                        addMode === "delete"
                        ? "folder"
                        : ""
                    )
                  }
                  title="Ajouter dossier"
                >
                  <span className="material-symbols-outlined">add</span>{" "}
                  dossiers
                </button>
                <button
                  onClick={() =>
                    setAddMode(
                      addMode === "" ||
                        addMode === "folder" ||
                        addMode === "delete"
                        ? "file"
                        : ""
                    )
                  }
                  title="Ajouter fichier"
                >
                  <span className="material-symbols-outlined">note_add</span>{" "}
                  fichiers
                </button>
                <button
                  onClick={() =>
                    setAddMode(
                      addMode === "" ||
                        addMode === "folder" ||
                        addMode === "file"
                        ? "delete"
                        : ""
                    )
                  }
                  title="Supprimer élément"
                >
                  <span className="material-symbols-outlined">delete</span>{" "}
                  supprimer
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.folderTree}>
        {folders.length > 0 &&
          folders
            .filter((item) => item.parentId === null)
            .map((item) => renderFolder(item))}
      </div>
      {showAddModal && (
        <AddFolderModal
          defaultParent={defaultParent}
          onCreate={handleCreateFolder}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {showAddFileModal && (
        <AddFileModal
          defaultParent={defaultParent}
          onCreate={handleCreateFile}
          onClose={() => setShowAddFileModal(false)}
        />
      )}
      {confirmOpen && (
        <ConfirmationPopup
          open={confirmOpen}
          itemToDelete={itemToDelete}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </section>
  );
}
