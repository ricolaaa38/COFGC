"use client";

import { useEffect, useState, useRef } from "react";
import { useData } from "../context/DataContext";
import { Feature } from "ol";
import { Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Cluster } from "ol/source";
import {
  Style,
  Icon,
  Text,
  Fill,
  Stroke,
  Circle as CircleStyle,
} from "ol/style";
import { fromLonLat } from "ol/proj";
import { getAllBreveCoords } from "../lib/db";

export default function BreveMarkers({ map, onMarkerClick, focusedBreve }) {
  const { activeFilters } = useData();
  const [coords, setCoords] = useState([]);
  const vectorLayerRef = useRef();

  useEffect(() => {
    getAllBreveCoords(activeFilters).then(setCoords);
  }, [activeFilters]);

  // Cursor: pointer :
  useEffect(() => {
    if (!map) return;

    const handlePointerMove = (evt) => {
      const hit = map.hasFeatureAtPixel(evt.pixel);
      map.getTargetElement().style.cursor = hit ? "pointer" : "";
    };

    map.on("pointermove", handlePointerMove);

    return () => {
      map.un("pointermove", handlePointerMove);
    };
  }, [map]);

  // Affichage des marqueurs/clusters et gestion du focus :
  useEffect(() => {
    if (!map || coords.length === 0) return;

    // Nettoyage des anciennes couches :
    map
      .getLayers()
      .getArray()
      .filter((layer) => layer.get("name") === "breveMarkers")
      .forEach((layer) => map.removeLayer(layer));
    if (vectorLayerRef.current) {
      map.removeLayer(vectorLayerRef.current);
      vectorLayerRef.current = null;
    }

    // Gestion du focus sur une brève spécifique :
    let filteredCoords = coords;
    if (focusedBreve) {
      filteredCoords = [
        {
          id: focusedBreve.id,
          longitude: focusedBreve.longitude,
          latitude: focusedBreve.latitude,
          titre: focusedBreve.titre,
        },
      ];

      const lon = parseFloat(focusedBreve.longitude);
      const lat = parseFloat(focusedBreve.latitude);
      if (!isNaN(lon) && !isNaN(lat)) {
        const center = fromLonLat([lon, lat]);
        map.getView().animate({ center, zoom: 9, duration: 500 });
      }
    }

    // Création des features :
    const features = filteredCoords
      .filter(({ longitude, latitude }) => longitude && latitude)
      .map(({ id, longitude, latitude, titre }) => {
        return new Feature({
          geometry: new Point(
            fromLonLat([parseFloat(longitude), parseFloat(latitude)])
          ),
          name: titre,
          id,
        });
      });

    if (features.length === 0) return;

    const vectorSource = new VectorSource({ features });

    // Création des clusters :
    const clusterSource = new Cluster({
      distance: 40,
      source: vectorSource,
    });

    // Styles des clusters et markeurs :
    const markerStyle = (feature) => {
      const size = feature.get("features").length;
      if (size > 1) {
        return new Style({
          image: new CircleStyle({
            radius: 16,
            fill: new Fill({ color: "#3399CC" }),
            stroke: new Stroke({ color: "#fff", width: 2 }),
          }),
          text: new Text({
            text: size.toString(),
            fill: new Fill({ color: "#fff" }),
          }),
        });
      } else {
        return new Style({
          image: new Icon({
            src: "/location.svg",
            anchor: [0.5, 1],
            scale: 1.2,
          }),
        });
      }
    };

    const vectorLayer = new VectorLayer({
      source: clusterSource,
      style: markerStyle,
    });
    vectorLayer.set("name", "breveMarkers");
    map.addLayer(vectorLayer);
    vectorLayerRef.current = vectorLayer;

    // Gestion du click sur la carte :
    const handleMapClick = (evt) => {
      map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        const clusterFeatures = feature.get("features");
        if (clusterFeatures.length === 1) {
          const id = clusterFeatures[0].get("id");
          if (id && typeof onMarkerClick === "function") {
            onMarkerClick(id);
            console.log(id);
          }
        } else if (clusterFeatures.length > 1) {
          // Zoom au click sur les clusters :
          const view = map.getView();
          const zoom = view.getZoom();
          view.animate({ zoom: zoom + 2, duration: 300 });
        }
      });
    };

    map.on("singleclick", handleMapClick);

    return () => {
      map.un("singleclick", handleMapClick);
      if (vectorLayerRef.current) {
        map.removeLayer(vectorLayerRef.current);
        vectorLayerRef.current = null;
      }
    };
  }, [map, coords, onMarkerClick, focusedBreve]);

  return null;
}
