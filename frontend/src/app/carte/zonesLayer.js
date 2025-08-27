"use client";

import { useEffect, useRef, useState } from "react";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Draw from "ol/interaction/Draw";
import Snap from "ol/interaction/Snap";
import Modify from "ol/interaction/Modify";
import Select from "ol/interaction/Select";
import { Style, Stroke, Fill, Text } from "ol/style";
import { toLonLat, fromLonLat } from "ol/proj";
import { Feature } from "ol";
import { Polygon } from "ol/geom";
import Overlay from "ol/Overlay";
import { createZoneMaritime, getAllZones, deleteZoneMaritime } from "../lib/db";

export default function ZonesLayer({ map }) {
  const sourceRef = useRef(null);
  const layerRef = useRef(null);
  const drawRef = useRef(null);
  const snapRef = useRef(null);
  const modifyRef = useRef(null);
  const selectRef = useRef(null);
  const overlayRef = useRef(null);
  const tooltipElRef = useRef(null);
  const [mode, setMode] = useState(null); // "draw" | "modify" | "delete" | null

  // simple html-escape to avoid injecting raw HTML from backend
  const escapeHtml = (str = "") =>
    String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  useEffect(() => {
    if (!map) return;

    const src = new VectorSource();
    const layer = new VectorLayer({
      source: src,
      style: (f) =>
        new Style({
          stroke: new Stroke({ color: f.get("color") || "#FFCC33", width: 2 }),
          fill: new Fill({ color: "rgba(255,204,51,0.15)" }),
          text: new Text({
            text: f.get("name") || "",
            fill: new Fill({ color: "#222" }),
          }),
        }),
    });
    layer.set("name", "zonesLayer");
    layer.setZIndex(200);
    map.addLayer(layer);
    sourceRef.current = src;
    layerRef.current = layer;

    // create tooltip overlay (hidden initially)
    const tooltipEl = document.createElement("div");
    tooltipEl.style.background = "rgba(255,255,255,0.95)";
    tooltipEl.style.padding = "6px 8px";
    tooltipEl.style.borderRadius = "6px";
    tooltipEl.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
    tooltipEl.style.fontSize = "13px";
    tooltipEl.style.maxWidth = "260px";
    tooltipEl.style.whiteSpace = "normal";
    tooltipEl.style.pointerEvents = "auto";
    tooltipEl.style.display = "none";
    tooltipElRef.current = tooltipEl;

    const overlay = new Overlay({
      element: tooltipEl,
      offset: [0, -12],
      positioning: "bottom-center",
      stopEvent: false,
    });
    overlayRef.current = overlay;
    map.addOverlay(overlay);

    // Load zones from backend and add to the vector source
    (async function loadZones() {
      try {
        const zones = await getAllZones();
        if (!Array.isArray(zones)) return;
        // clear existing features
        src.clear();
        for (const z of zones) {
          if (!z.points || !Array.isArray(z.points) || z.points.length === 0)
            continue;
          // sort by ordre to ensure correct ring order
          const pts = [...z.points].sort(
            (a, b) => (a.ordre || 0) - (b.ordre || 0)
          );
          const ring = pts.map((p) =>
            fromLonLat([Number(p.longitude), Number(p.latitude)])
          );
          // ensure closed ring (first == last)
          const first = ring[0];
          const last = ring[ring.length - 1];
          if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
            ring.push(first);
          }
          const feat = new Feature({
            geometry: new Polygon([ring]),
          });
          feat.setId(z.id);
          feat.set("name", z.name || "");
          feat.set("color", z.color || "#FFCC33");
          feat.set("description", z.description || "");
          src.addFeature(feat);
        }
      } catch (error) {
        console.error("ZonesLayer: error loading zones", error);
      }
    })();

    // toolbar DOM
    const toolbar = document.createElement("div");
    toolbar.style.position = "absolute";
    toolbar.style.top = "7.5em";
    toolbar.style.right = "0.8em";
    toolbar.style.zIndex = 1000;
    toolbar.style.background = "rgba(255,255,255,0.95)";
    toolbar.style.padding = "6px";
    toolbar.style.borderRadius = "6px";
    toolbar.style.display = "flex";
    toolbar.style.flexDirection = "column";
    toolbar.style.gap = "6px";

    const makeBtn = (label, onClick) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.onclick = onClick;
      b.style.minWidth = "110px";
      return b;
    };
    toolbar.appendChild(makeBtn("Dessiner zone", () => setMode("draw")));
    toolbar.appendChild(makeBtn("Supprimer zone", () => setMode("delete")));
    toolbar.appendChild(
      makeBtn("Rafraîchir", async () => {
        try {
          const zones = await getAllZones();
          const srcCurr = sourceRef.current;
          if (!srcCurr) return;
          srcCurr.clear();
          zones.forEach((z) => {
            if (!z.points || !Array.isArray(z.points) || z.points.length === 0)
              return;
            const pts = [...z.points].sort(
              (a, b) => (a.ordre || 0) - (b.ordre || 0)
            );
            const ring = pts.map((p) =>
              fromLonLat([Number(p.longitude), Number(p.latitude)])
            );
            const first = ring[0];
            const last = ring[ring.length - 1];
            if (first && last && (first[0] !== last[0] || first[1] !== last[1]))
              ring.push(first);
            const feat = new Feature({ geometry: new Polygon([ring]) });
            feat.setId(z.id);
            feat.set("name", z.name || "");
            feat.set("color", z.color || "#FFCC33");
            feat.set("description", z.description || "");
            srcCurr.addFeature(feat);
          });
        } catch (err) {
          console.error("ZonesLayer: refresh failed", err);
        }
      })
    );
    toolbar.appendChild(makeBtn("Annuler", () => setMode(null)));

    map.getTargetElement().appendChild(toolbar);

    // click handler: show tooltip with name + description for zonesLayer features
    const handleMapClick = (evt) => {
      let found = false;
      map.forEachFeatureAtPixel(
        evt.pixel,
        (feature, layer) => {
          if (!layer || layer.get("name") !== "zonesLayer") return;
          found = true;
          const geom = feature.getGeometry();
          const coord =
            geom && typeof geom.getInteriorPoint === "function"
              ? geom.getInteriorPoint().getCoordinates()
              : evt.coordinate;
          const name = feature.get("name") || "—";
          const description = feature.get("description") || "";
          const tooltipElLocal = tooltipElRef.current;
          const overlayLocal = overlayRef.current;
          if (tooltipElLocal && overlayLocal) {
            tooltipElLocal.innerHTML = `<strong>${escapeHtml(name)}</strong>${
              description
                ? `<div style="margin-top:4px;color:#333">${escapeHtml(
                    description
                  )}</div>`
                : ""
            }`;
            tooltipElLocal.style.display = "block";
            overlayLocal.setPosition(coord);
          }
          return true; // stop iteration
        },
        { hitTolerance: 5 }
      );
      if (!found) {
        // hide tooltip
        const tooltipElLocal = tooltipElRef.current;
        const overlayLocal = overlayRef.current;
        if (tooltipElLocal) tooltipElLocal.style.display = "none";
        if (overlayLocal) overlayLocal.setPosition(undefined);
      }
    };

    // pointermove: cursor pointer when hovering a zone
    const handlePointerMove = (evt) => {
      const hit = map.hasFeatureAtPixel(evt.pixel, {
        layerFilter: (l) => l && l.get("name") === "zonesLayer",
      });
      // only set pointer when hovering zones; do not clear cursor here
      // so other components (breveMarkers) can set it for their features.
      if (hit) map.getTargetElement().style.cursor = "pointer";
    };

    map.on("singleclick", handleMapClick);
    map.on("pointermove", handlePointerMove);

    return () => {
      if (map && layer) map.removeLayer(layer);
      if (toolbar.parentNode) toolbar.parentNode.removeChild(toolbar);
      if (tooltipEl.parentNode) tooltipEl.parentNode.removeChild(tooltipEl);
      if (overlayRef.current) map.removeOverlay(overlayRef.current);
      map.un("singleclick", handleMapClick);
      map.un("pointermove", handlePointerMove);
    };
  }, [map]);

  useEffect(() => {
    if (!map || !sourceRef.current) return;

    // cleanup previous interactions
    [drawRef, modifyRef, snapRef, selectRef].forEach((r) => {
      if (r.current) {
        map.removeInteraction(r.current);
        r.current = null;
      }
    });

    const src = sourceRef.current;

    if (mode === "draw") {
      const draw = new Draw({ source: src, type: "Polygon" });
      draw.on("drawend", async (evt) => {
        const feat = evt.feature;
        // prompts
        const name = window.prompt("Nom de la zone :", "Zone test") || "Zone";
        const color = window.prompt("Couleur (hex) :", "#FF0000") || "#FF0000";
        const description = window.prompt("Description :", "") || "";

        feat.set("name", name);
        feat.set("color", color);

        // get exterior ring coordinates in map projection, convert to lon/lat
        const geomCoords = feat.getGeometry().getCoordinates(); // [ [ [x,y], ... ] , ... ]
        if (!Array.isArray(geomCoords) || geomCoords.length === 0) {
          alert("Géométrie invalide.");
          src.removeFeature(feat);
          return;
        }
        const outerRing = geomCoords[0];
        const points = outerRing.map((c, idx) => {
          const [lon, lat] = toLonLat(c);
          return {
            latitude: Number(lat.toFixed(7)),
            longitude: Number(lon.toFixed(7)),
            ordre: idx + 1,
          };
        });

        const zoneDto = {
          name,
          color,
          description,
          points,
        };

        try {
          const created = await createZoneMaritime(zoneDto);
          // if backend returns id
          if (created && (created.id || created._id)) {
            feat.setId(created.id || created._id);
          }
          alert("Zone créée.");
        } catch (err) {
          console.error("create zone failed", err);
          src.removeFeature(feat);
          alert("Échec de la création de la zone : " + (err.message || err));
        } finally {
          setMode(null);
        }
      });
      drawRef.current = draw;
      map.addInteraction(draw);

      const snap = new Snap({ source: src });
      snapRef.current = snap;
      map.addInteraction(snap);
    } else if (mode === "delete") {
      // Select interaction limited to our zones layer
      const select = new Select({
        hitTolerance: 6,
        layerFilter: (l) => l && l.get("name") === "zonesLayer",
      });
      select.on("select", async (evt) => {
        const selected = evt.selected && evt.selected[0];
        if (!selected) return;
        const feat = selected;
        const id = feat.getId();
        const name = feat.get("name") || id;
        // if feature has no id -> not saved on server
        if (!id) {
          if (
            !confirm(
              `La zone "${name}" n'est pas enregistrée. Supprimer localement ?`
            )
          ) {
            select.getFeatures().clear();
            setMode(null);
            return;
          }
          src.removeFeature(feat);
          select.getFeatures().clear();
          setMode(null);
          return;
        }
        if (!confirm(`Supprimer la zone "${name}" (id=${id}) ?`)) {
          select.getFeatures().clear();
          setMode(null);
          return;
        }
        try {
          await deleteZoneMaritime(id);
          src.removeFeature(feat);
          alert("Zone supprimée.");
        } catch (err) {
          console.error("Erreur suppression zone :", err);
          alert("Échec de la suppression : " + (err.message || err));
        } finally {
          select.getFeatures().clear();
          setMode(null);
        }
      });
      selectRef.current = select;
      map.addInteraction(select);
    }

    return () => {
      // interactions removed at top on next mode change
    };
  }, [mode, map]);

  return null;
}
//
