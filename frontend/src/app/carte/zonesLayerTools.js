"use client";

import { useEffect, useRef, useState } from "react";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Draw from "ol/interaction/Draw";
import Snap from "ol/interaction/Snap";
import Select from "ol/interaction/Select";
import { toLonLat } from "ol/proj";
import { createZoneMaritime, deleteZoneMaritime } from "../lib/db";
import Styles from "./zonesLayer.module.css";
import { useData } from "../context/DataContext";

export default function ZonesLayerTools({ map }) {
  const sourceRef = useRef(null);
  const fallbackCreatedRef = useRef(false);
  const drawRef = useRef(null);
  const snapRef = useRef(null);
  const selectRef = useRef(null);
  const { setNeedRefresh } = useData();
  const [modalOverlayOpen, setModalOverlayOpen] = useState(false);

  const [mode, setMode] = useState(null);

  // Modal
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [newZoneData, setNewZoneData] = useState({
    name: "",
    color: "#FF0000",
    description: "",
  });
  const [pendingFeature, setPendingFeature] = useState(null);

  // Toast
  const [toast, setToast] = useState({ type: "", message: "" });
  const triggerToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), 3000);
  };

  // Helper: find current zonesLayer source
  const findZonesSource = () => {
    if (!map) return null;
    const existingLayer = map
      .getLayers()
      .getArray()
      .find((l) => l && l.get && l.get("name") === "zonesLayer");
    return existingLayer ? existingLayer.getSource() : null;
  };

  // On mount: try to attach to an existing zonesLayer; create a fallback only if truly needed
  useEffect(() => {
    if (!map) return;

    const src = findZonesSource();
    if (src) {
      sourceRef.current = src;
    } else {
      // create a lightweight fallback so tools work even if display layer hasn't been added yet
      const fallback = new VectorSource();
      sourceRef.current = fallback;
      const fallbackLayer = new VectorLayer({ source: fallback });
      fallbackLayer.set("name", "zonesLayer");
      map.addLayer(fallbackLayer);
      fallbackCreatedRef.current = true;
    }

    return () => {
      // cleanup fallback layer if we created it
      if (fallbackCreatedRef.current && map) {
        const layers = map.getLayers().getArray();
        const fallback = layers.find(
          (l) =>
            l &&
            l.get &&
            l.get("name") === "zonesLayer" &&
            l.getSource() === sourceRef.current
        );
        if (fallback) map.removeLayer(fallback);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Update sourceRef when mode changes (ensures we use the up-to-date shared layer if it was added later)
  useEffect(() => {
    if (!map) return;

    // refresh sourceRef to the latest zonesLayer source if present
    const currentZonesSrc = findZonesSource();
    if (currentZonesSrc) {
      sourceRef.current = currentZonesSrc;
    } else if (!sourceRef.current) {
      // fallback already handled in mount effect
      const src = new VectorSource();
      sourceRef.current = src;
    }

    // remove previous interactions
    [drawRef, snapRef, selectRef].forEach((r) => {
      if (r.current) {
        map.removeInteraction(r.current);
        r.current = null;
      }
    });

    const src = sourceRef.current;
    if (!src) return;

    if (mode === "draw") {
      const draw = new Draw({ source: src, type: "Polygon" });
      draw.on("drawend", (evt) => {
        setPendingFeature(evt.feature);
        setNewZoneData({ name: "", color: "#FF0000", description: "" });
        setShowZoneModal(true);
      });
      drawRef.current = draw;
      map.addInteraction(draw);

      const snap = new Snap({ source: src });
      snapRef.current = snap;
      map.addInteraction(snap);
    }

    if (mode === "delete") {
      const select = new Select({
        hitTolerance: 6,
        layerFilter: (l) => l && l.get("name") === "zonesLayer",
      });
      select.on("select", async (evt) => {
        const feat = evt.selected?.[0];
        if (!feat) return;
        const id = feat.getId();
        const name = feat.get("name") || id;

        if (!id) {
          // local feature -> remove from all sources
          removeFeatureFromAllSources(feat);
          triggerToast("success", `Zone "${name}" supprimée localement`);
          setMode(null);
          return;
        }
        try {
          await deleteZoneMaritime(id);
          // remove from all layers/sources (robust when multiple sources exist)
          removeFeatureByIdFromAllSources(id);
          triggerToast("success", `Zone "${name}" supprimée`);
          setNeedRefresh((prev) => !prev);
        } catch (err) {
          triggerToast("error", "Échec suppression : " + (err.message || err));
        } finally {
          setMode(null);
        }
      });
      selectRef.current = select;
      map.addInteraction(select);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, map]);

  // Helpers to remove features robustly
  const removeFeatureFromAllSources = (feature) => {
    if (!map) return;
    const layers = map.getLayers().getArray();
    layers.forEach((l) => {
      try {
        const s = l.getSource && l.getSource();
        if (s && s.removeFeature) s.removeFeature(feature);
      } catch (e) {
        // ignore layers that don't expose source/removeFeature
      }
    });
  };

  const removeFeatureByIdFromAllSources = (id) => {
    if (!map) return;
    const layers = map.getLayers().getArray();
    layers.forEach((l) => {
      try {
        const s = l.getSource && l.getSource();
        if (s && s.getFeatureById) {
          const f = s.getFeatureById(id);
          if (f && s.removeFeature) s.removeFeature(f);
        }
      } catch (e) {
        // ignore
      }
    });
  };

  // Sauvegarde de la zone
  const handleSaveZone = async () => {
    if (!pendingFeature) return;
    const feat = pendingFeature;
    feat.set("name", newZoneData.name || "Zone");
    feat.set("color", newZoneData.color);
    feat.set("description", newZoneData.description || "");

    const geomCoords = feat.getGeometry().getCoordinates();
    const outerRing = geomCoords[0];
    const points = outerRing.map((c, idx) => {
      const [lon, lat] = toLonLat(c);
      return {
        latitude: Number(lat.toFixed(7)),
        longitude: Number(lon.toFixed(7)),
        ordre: idx + 1,
      };
    });

    try {
      const created = await createZoneMaritime({ ...newZoneData, points });
      if (created && (created.id || created._id)) {
        feat.setId(created.id || created._id);
      }
      setNeedRefresh((prev) => !prev);
      triggerToast("success", "Zone créée avec succès");
    } catch (err) {
      // remove local feature from all sources if persist fails
      removeFeatureFromAllSources(feat);
      triggerToast("error", "Échec création : " + (err.message || err));
    } finally {
      setShowZoneModal(false);
      setPendingFeature(null);
      setMode(null);
    }
  };

  const cancelDraw = () => {
    if (pendingFeature) {
      removeFeatureFromAllSources(pendingFeature);
    }
    setPendingFeature(null);
    setShowZoneModal(false);
    setMode(null);
  };

  return (
    <>
      {modalOverlayOpen ? (
        <div className={Styles.toolbarMenu}>
          <button
            className={mode === "draw" ? Styles.toolbarMenuBtnActive : ""}
            onClick={() => setMode("draw")}
          >
            Dessiner zone
          </button>
          <button
            className={mode === "delete" ? Styles.toolbarMenuBtnActive : ""}
            onClick={() => setMode("delete")}
          >
            Supprimer zone
          </button>
          <button onClick={() => setMode(null)}>Annuler</button>
          <button onClick={() => setModalOverlayOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      ) : (
        <button
          className={Styles.openToolbarMenuBtn}
          onClick={() => setModalOverlayOpen(true)}
        >
          <span className="material-symbols-outlined">menu_open</span>
        </button>
      )}

      {showZoneModal && (
        <div className={Styles.modalOverlay}>
          <h3>Nouvelle zone</h3>
          <form
            className={Styles.modalForm}
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveZone();
            }}
          >
            <div className={Styles.modalContent}>
              <label>Nom :</label>
              <input
                type="text"
                value={newZoneData.name}
                onChange={(e) =>
                  setNewZoneData({ ...newZoneData, name: e.target.value })
                }
                required
              />
            </div>
            <div className={Styles.modalContent}>
              <label>Couleur :</label>
              <input
                type="color"
                value={newZoneData.color}
                onChange={(e) =>
                  setNewZoneData({ ...newZoneData, color: e.target.value })
                }
              />
            </div>
            <div className={Styles.modalContent}>
              <label>Description :</label>
              <textarea
                value={newZoneData.description}
                onChange={(e) =>
                  setNewZoneData({
                    ...newZoneData,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className={Styles.modalActions}>
              <button type="submit">Valider</button>
              <button type="button" onClick={cancelDraw}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {toast.message && (
        <div className={`${Styles.toast} ${Styles[toast.type]}`}>
          {toast.message}
        </div>
      )}
    </>
  );
}
