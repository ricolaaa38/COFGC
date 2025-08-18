"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
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
  updateFile,
  updateDossier,
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

  const [activeDragItem, setActiveDragItem] = useState(null);

  const normalizeKey = (id) =>
    id === null || id === undefined ? null : String(id);
  const formatDroppableId = (id) =>
    `folder:${id === null || id === undefined ? "root" : String(id)}`;

  const parseActiveId = (activeId) => {
    if (!activeId) return { type: null, id: null };
    const parts = String(activeId).split(":");
    if (parts.length !== 2) return { type: null, id: null };
    const type = parts[0];
    const raw = parts[1];
    if (raw === "root" || raw === "null") return { type, id: null };
    const num = Number(raw);
    return { type, id: Number.isNaN(num) ? null : num };
  };

  const findFolderById = (tree, id) => {
    for (const f of tree) {
      if (f.id === id) return f;
      if (f.children && f.children.length) {
        const found = findFolderById(f.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const findItemInExpanded = (expanded, type, id) => {
    if (type === "file") {
      for (const key of Object.keys(expanded)) {
        const block = expanded[key];
        if (block && block.files) {
          const found = block.files.find((fi) => fi.id === id);
          if (found) return found;
        }
      }
    } else if (type === "folder") {
      const stack = [...folders];
      while (stack.length) {
        const cur = stack.shift();
        if (cur.id === id) return cur;
        const key = normalizeKey(cur.id);
        const block = expanded[key];
        if (block && block.folders) {
          for (const sf of block.folders) stack.push(sf);
        }
      }
    }
    return null;
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const { type, id } = parseActiveId(active.id);
    const item = findItemInExpanded(expandedFolders, type, id);
    if (item) setActiveDragItem({ type, id, name: item.name });
  };

  const handleDragCancel = () => {
    setActiveDragItem(null);
  };

  const buildParentMap = () => {
    const map = new Map();

    const norm = (p) => (p && typeof p === "object" ? p.id : p);

    const traverse = (list, parentId = null) => {
      if (!list || !list.length) return;
      for (const f of list) {
        map.set(f.id, norm(f.parentId) ?? parentId);
        if (f.children && f.children.length) traverse(f.children, f.id);
      }
    };

    traverse(folders, null);

    for (const key of Object.keys(expandedFolders)) {
      const block = expandedFolders[key];
      if (!block) continue;
      if (block.folders && block.folders.length) {
        const parentId =
          key === "null" || key === "undefined" ? null : Number(key);
        traverse(block.folders, parentId);
      }
    }

    return map;
  };

  const isDescendantOf = (ancestorId, nodeId) => {
    if (ancestorId === null || ancestorId === undefined) return false;
    if (nodeId === null || nodeId === undefined) return false;
    const map = buildParentMap();
    let current = nodeId;
    while (current !== null && current !== undefined) {
      const parent = map.has(current) ? map.get(current) : null;
      if (parent === null || parent === undefined) return false;
      if (parent === ancestorId) return true;
      current = parent;
    }
    return false;
  };

  // ...existing code...
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveDragItem(null);
    if (!over || active.id === over.id) return;

    const { type: draggedType, id: draggedId } = parseActiveId(active.id);
    const { type: overType, id: overId } = parseActiveId(over.id);

    // n'autoriser que le drop sur des dossiers
    if (overType !== "folder") return;
    const overFolderId = overId; // peut être null pour root

    if (!draggedType || draggedId == null) return;

    // on récupère l'élément déplacé (fichier ou dossier)
    const draggedItem = findItemInExpanded(
      expandedFolders,
      draggedType,
      draggedId
    );
    if (!draggedItem) return;

    // normalise parentId existant
    const oldParentRaw = draggedItem.parentId;
    const oldParentId =
      oldParentRaw && typeof oldParentRaw === "object"
        ? oldParentRaw.id
        : oldParentRaw;

    // Empêcher déplacement inutile : même parent (file OR folder) -> no-op
    const sameParent =
      (oldParentId == null && overFolderId == null) ||
      (oldParentId != null && oldParentId === overFolderId);
    if (sameParent) {
      // rien à faire
      return;
    }

    // Empêcher dossier -> lui-même ou dans un descendant (profond)
    if (draggedType === "folder") {
      if (overFolderId === draggedId) {
        setError("Impossible de déplacer un dossier dans lui‑même.");
        return;
      }
      if (isDescendantOf(draggedId, overFolderId)) {
        setError(
          "Impossible de déplacer un dossier dans l'un de ses sous‑dossiers."
        );
        return;
      }
    }

    // --- suite existante : mise à jour optimiste + appel API
    const oldKey = normalizeKey(oldParentId);
    const newKey = normalizeKey(overFolderId);
    setExpandedFolders((prev) => {
      const next = { ...prev };
      if (next[oldKey]) {
        next[oldKey] = {
          ...next[oldKey],
          folders:
            next[oldKey].folders?.filter((f) => f.id !== draggedItem.id) || [],
          files:
            next[oldKey].files?.filter((f) => f.id !== draggedItem.id) || [],
        };
      }
      if (next[newKey]) {
        if (draggedType === "file") {
          next[newKey] = {
            ...next[newKey],
            files: [...(next[newKey].files || []), draggedItem],
          };
        } else {
          next[newKey] = {
            ...next[newKey],
            folders: [...(next[newKey].folders || []), draggedItem],
          };
        }
      }
      return next;
    });

    if (draggedType === "folder" && oldParentId === null) {
      setFolders((prev) => prev.filter((f) => f.id !== draggedItem.id));
    }

    try {
      if (draggedType === "file") {
        await updateFile({
          id: draggedItem.id,
          parentId: overFolderId,
          name: draggedItem.name,
        });
      } else {
        await updateDossier({
          id: draggedItem.id,
          parentId: overFolderId,
          name: draggedItem.name,
        });
      }

      await fetchFolders();

      if (oldParentId !== null && oldParentId !== undefined) {
        const updatedChildren = await getFolderChildren(oldParentId);
        setExpandedFolders((prev) => ({
          ...prev,
          [String(oldParentId)]: updatedChildren,
        }));
      }
      const updatedTarget = await getFolderChildren(overFolderId);
      setExpandedFolders((prev) => ({
        ...prev,
        [String(overFolderId)]: updatedTarget,
      }));

      setError(null);
    } catch (err) {
      console.error("❌ Erreur API :", err);
      await fetchFolders();
      setExpandedFolders({});
    }
  };

  function DragHandle({ id, type }) {
    const draggableId = `${type}:${id}`;
    const { attributes, listeners, setNodeRef } = useDraggable({
      id: draggableId,
    });
    return (
      <div className={styles.dragHandle}>
        <span
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          className="material-symbols-outlined"
          title="Déplacer"
          style={{ cursor: "grab", userSelect: "none" }}
        >
          drag_indicator
        </span>
      </div>
    );
  }

  const DroppableFolder = ({ id, children }) => {
    const droppableId = formatDroppableId(id);
    const { setNodeRef, isOver } = useDroppable({ id: droppableId });
    return (
      <div
        ref={setNodeRef}
        className={`${styles.droppableFolder} ${isOver ? styles.isOver : ""}`}
      >
        {children}
      </div>
    );
  };

  useEffect(() => {
    async function fetchFileAndOpenFolders() {
      if (fileId) {
        try {
          const fileMeta = await getFileMeta(Number(fileId));
          let currentParentId = fileMeta.parentId;

          const parentIds = [];
          while (currentParentId) {
            parentIds.unshift(currentParentId);
            const parentIdValue =
              typeof currentParentId === "object"
                ? currentParentId.id
                : currentParentId;
            const parentMeta = await getFolderMeta(parentIdValue);
            currentParentId = parentMeta.parentId;
          }
          for (const id of parentIds) {
            const folderId = typeof id === "object" ? id.id : id;
            await toggleFolder(folderId);
          }
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

  const closeFolderAndDescendants = useCallback((folderId) => {
    setExpandedFolders((prev) => {
      const newState = { ...prev };
      const removeKeys = (id) => {
        const key = normalizeKey(id);
        if (newState[key] && newState[key] !== false && newState[key].folders) {
          for (const subFolder of newState[key].folders) {
            removeKeys(subFolder.id);
          }
        }
        delete newState[key];
      };
      removeKeys(folderId);
      return newState;
    });
  }, []);

  const toggleFolder = useCallback(
    async (folderId) => {
      if (loadingFolder === folderId) return;
      const key = normalizeKey(folderId);
      if (expandedFolders[key]) {
        closeFolderAndDescendants(folderId);
      } else {
        setLoadingFolder(folderId);
        try {
          const children = await getFolderChildren(folderId);
          setExpandedFolders((prev) => ({
            ...prev,
            [String(folderId)]: children,
          }));
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
        const parentId = itemToDelete.parentId.id
          ? itemToDelete.parentId.id
          : itemToDelete.parentId;
        if (expandedFolders[String(parentId)]) {
          const updatedChildren = await getFolderChildren(parentId);
          setExpandedFolders((prev) => ({
            ...prev,
            [String(parentId)]: updatedChildren,
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
    const key = normalizeKey(folder.id);
    const hasChildren = expandedFolders[key];
    const isLoading = loadingFolder === folder.id;

    const folderParentRaw = folder.parentId;
    const folderParentId =
      folderParentRaw && typeof folderParentRaw === "object"
        ? folderParentRaw.id
        : folderParentRaw;
    const isRootFolder =
      folderParentId === null || folderParentId === undefined;

    return (
      <DroppableFolder id={folder.id} key={folder.id}>
        <div className={styles.folderItem}>
          {!isRootFolder && userRole === "admin" && (
            <DragHandle id={folder.id} type="folder" />
          )}

          <div
            onClick={() => toggleFolder(folder.id)}
            className={styles.folderName}
          >
            {hasChildren ? (
              <span className="material-symbols-outlined">folder_open</span>
            ) : (
              <span className="material-symbols-outlined">folder</span>
            )}
            <p>{folder.name}</p>
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
        </div>

        {/* Enfants */}
        {hasChildren && (
          <div className={styles.children}>
            {isLoading ? (
              <span className="material-symbols-outlined">hourglass_top</span>
            ) : (
              <>
                {hasChildren.folders.map(renderFolder)}
                {hasChildren.files.map((file) => (
                  <div key={file.id} className={styles.childFile}>
                    {userRole === "admin" && (
                      <DragHandle id={file.id} type="file" />
                    )}
                    <div
                      onClick={() => handleFileClick(file)}
                      className={styles.fileName}
                    >
                      <span className="material-symbols-outlined">
                        picture_as_pdf
                      </span>
                      <p>{file.name}</p>
                    </div>
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
      </DroppableFolder>
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
          [String(parentId)]: updatedChildren,
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
          [String(parentId)]: updatedChildren,
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
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
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
              .filter((item) => {
                const p = item.parentId;
                const pid = p && typeof p === "object" ? p.id : p;
                return pid === null;
              })
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

      <DragOverlay>
        {activeDragItem ? (
          <div className={styles.dragOverlay}>
            <span className="material-symbols-outlined">
              {activeDragItem.type === "file" ? "picture_as_pdf" : "folder"}
            </span>
            <p>{activeDragItem.name}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
