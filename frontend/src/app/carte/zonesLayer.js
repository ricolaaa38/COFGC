"use client";

import { useEffect, useRef, useState } from "react";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Stroke, Fill, Text } from "ol/style";
import { fromLonLat } from "ol/proj";
import { Feature } from "ol";
import { Polygon } from "ol/geom";
import { getAllZones } from "../lib/db";
import Styles from "./zonesLayer.module.css";
import { useData } from "../context/DataContext";

export default function ZonesLayer({ map }) {
  const layerRef = useRef(null);
  const sourceRef = useRef(null);
  const { needRefresh } = useData();
  const [tooltip, setTooltip] = useState({
    visible: false,
    name: "",
    description: "",
    pixel: [0, 0],
  });

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
            font: "bold 14px Arial",
          }),
        }),
    });
    layer.set("name", "zonesLayer");
    map.addLayer(layer);
    layerRef.current = layer;
    sourceRef.current = src;

    async function loadZones() {
      try {
        const zones = await getAllZones();
        src.clear();
        zones.forEach((z) => {
          if (!Array.isArray(z.points) || z.points.length === 0) return;
          const pts = [...z.points].sort(
            (a, b) => (a.ordre || 0) - (b.ordre || 0)
          );
          const ring = pts.map((p) =>
            fromLonLat([Number(p.longitude), Number(p.latitude)])
          );
          if (
            ring[0] &&
            ring[ring.length - 1] &&
            (ring[0][0] !== ring[ring.length - 1][0] ||
              ring[0][1] !== ring[ring.length - 1][1])
          ) {
            ring.push(ring[0]);
          }
          const feat = new Feature({ geometry: new Polygon([ring]) });
          feat.setId(z.id);
          feat.set("name", z.name || "");
          feat.set("color", z.color || "#FFCC33");
          feat.set("description", z.description || "");
          src.addFeature(feat);
        });
      } catch (e) {
        console.error("Erreur chargement zones", e);
      }
    }

    loadZones();

    const handleClick = (evt) => {
      let found = false;
      map.forEachFeatureAtPixel(
        evt.pixel,
        (feature, layer) => {
          if (!layer || layer.get("name") !== "zonesLayer") return;
          found = true;
          setTooltip({
            visible: true,
            name: feature.get("name") || "—",
            description: feature.get("description") || "",
            pixel: evt.pixel,
          });
          return true;
        },
        { hitTolerance: 5 }
      );
      if (!found) {
        setTooltip({
          visible: false,
          name: "",
          description: "",
          pixel: [0, 0],
        });
      }
    };

    map.on("singleclick", handleClick);

    return () => {
      map.removeLayer(layer);
      map.un("singleclick", handleClick);
    };
  }, [map, needRefresh]);

  return (
    <>
      {tooltip.visible && (
        <div
          className={Styles.zoneTooltip}
          style={{
            position: "absolute",
            transform: `translate(${tooltip.pixel[0]}px, ${tooltip.pixel[1]}px)`,
          }}
        >
          <h4>{tooltip.name}</h4>
          <p>{tooltip.description}</p>
        </div>
      )}
    </>
  );
}
