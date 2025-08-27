"use client";

import { useEffect, useRef, useState } from "react";
import Footer from "../components/footer";
import Header from "../components/header";
import styles from "./page.module.css";
import { Map, View } from "ol";
import XYZ from "ol/source/XYZ";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import "ol/ol.css";
import FiltreSection from "../components/filtreSection";
import BreveSection from "../components/breveSection";
import BreveMarkers from "./breveMarkers";
import FullScreen from "ol/control/FullScreen";
import ScaleLine from "ol/control/ScaleLine";
import Zoom from "ol/control/Zoom";
import OverviewMap from "ol/control/OverviewMap";
import MousePosition from "ol/control/MousePosition";
import { toLonLat, fromLonLat } from "ol/proj";
import BrevesGestionButtons from "../components/brevesGestionButton";
import ZonesLayer from "./zonesLayer";

export default function Carte() {
  const mapRef = useRef(null);
  const overviewMapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [selectedBreveId, setSelectedBreveId] = useState(null);
  const [focusedBreve, setFocusedBreve] = useState(null);
  const [baseLayer, setBaseLayer] = useState("satellite");
  const [showOpenSeaMap, setShowOpenSeaMap] = useState(false);

  const baseLayersRef = useRef({
    osm: new TileLayer({
      source: new OSM(),
      visible: false,
    }),
    satellite: new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attributions:
          "© Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      }),
      visible: true,
    }),
    openseamap: new TileLayer({
      source: new XYZ({
        url: "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png",
        attributions: "© OpenSeaMap contributors",
      }),
      visible: false,
      zIndex: 10,
    }),
    opentopomap: new TileLayer({
      source: new XYZ({
        url: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
        attributions: "© OpenTopoMap (CC-BY-SA)",
      }),
      visible: false,
    }),
  });

  function getBaseLayerForOverview(baseLayer, baseLayersRef) {
    switch (baseLayer) {
      case "osm":
        return new TileLayer({ source: new OSM() });
      case "satellite":
        return new TileLayer({
          source: new XYZ({
            url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          }),
        });
      case "opentopomap":
        return new TileLayer({
          source: new XYZ({
            url: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
          }),
        });
      default:
        return new TileLayer({ source: new OSM() });
    }
  }

  useEffect(() => {
    window.openBreveDetailsById = setSelectedBreveId;
    return () => {
      window.openBreveDetailsById = undefined;
    };
  }, []);

  useEffect(() => {
    const mapInstance = new Map({
      target: "map",
      layers: [
        baseLayersRef.current.osm,
        baseLayersRef.current.satellite,
        baseLayersRef.current.openseamap,
        baseLayersRef.current.opentopomap,
      ],
      view: new View({
        center: fromLonLat([8, 35]),
        zoom: 2,
      }),
      controls: [],
    });
    mapInstance.addControl(new Zoom());
    mapInstance.addControl(new ScaleLine());
    mapInstance.addControl(
      new FullScreen({
        className: styles.olFullScreenPosition,
      })
    );
    mapInstance.addControl(
      new MousePosition({
        className: styles.olMousePosition,
        coordinateFormat: (coord) => formatLonLatToDMS(toLonLat(coord)),
      })
    );
    const overviewMapControl = new OverviewMap({
      className: `ol-overviewmap ${styles.olOverviewBottomRight}`,
      layers: [getBaseLayerForOverview(baseLayer)],
      collapsed: false,
    });
    overviewMapRef.current = overviewMapControl;
    mapInstance.addControl(overviewMapControl);
    mapRef.current = mapInstance;
    setMap(mapInstance);
    return () => {
      mapInstance.setTarget(null);
    };
  }, []);

  useEffect(() => {
    if (overviewMapRef.current) {
      overviewMapRef.current
        .getOverviewMap()
        .getLayers()
        .setAt(0, getBaseLayerForOverview(baseLayer));
    }
  }, [baseLayer]);

  const handleBaseLayerChange = (selected) => {
    setBaseLayer(selected);
    baseLayersRef.current.osm.setVisible(selected === "osm");
    baseLayersRef.current.satellite.setVisible(selected === "satellite");
    baseLayersRef.current.opentopomap.setVisible(selected === "opentopomap");
  };

  useEffect(() => {
    baseLayersRef.current.openseamap.setVisible(showOpenSeaMap);
  }, [showOpenSeaMap]);

  function toDMS(coord, pos) {
    const abs = Math.abs(coord);
    const deg = Math.floor(abs);
    const minFloat = (abs - deg) * 60;
    const min = Math.floor(minFloat);
    const sec = ((minFloat - min) * 60).toFixed(2);
    const direction =
      pos === "lon" ? (coord < 0 ? "W" : "E") : coord < 0 ? "S" : "N";
    return `${deg}°${min}'${sec}"${direction}`;
  }

  function formatLonLatToDMS([lon, lat]) {
    return `${toDMS(lat, "lat")} ${toDMS(lon, "lon")}`;
  }

  const resetMapView = () => {
    if (map) {
      map.getView().animate({
        center: fromLonLat([8, 35]),
        zoom: 2,
        duration: 500,
      });
    }
  };

  return (
    <div id={styles.cartePage}>
      <Header />
      <div className={styles.filtersAndGestion}>
        <FiltreSection />
        <BrevesGestionButtons />
      </div>
      <div className={styles.bodyCartePage}>
        <div id="map" className={styles.mapContainer}>
          <div
            className={styles.selectMapLayer}
            title="Changer le fond de carte et/ou ajouter des layers"
          >
            <span
              className={`${styles.chevronSpan} ${"material-symbols-outlined"}`}
            >
              keyboard_arrow_down
            </span>
            <div>
              <span>Fond de carte :</span>
              <label title="openStreetMap">
                <input
                  type="radio"
                  name="fond-de-carte"
                  value="osm"
                  checked={baseLayer === "osm"}
                  onChange={() => handleBaseLayerChange("osm")}
                />
                OpenStreetMap
              </label>
              <label title="Satellite">
                <input
                  type="radio"
                  name="fond-de-carte"
                  value="satellite"
                  checked={baseLayer === "satellite"}
                  onChange={() => handleBaseLayerChange("satellite")}
                />
                Satellite
              </label>
              <label title="OpenTopoMap">
                <input
                  type="radio"
                  name="fond-de-carte"
                  value="opentopomap"
                  checked={baseLayer === "opentopomap"}
                  onChange={() => handleBaseLayerChange("opentopomap")}
                />
                OpenTopoMap
              </label>
            </div>
            <div>
              <span>Surcouche :</span>
              <label title="OpenSeaMap">
                <input
                  type="checkbox"
                  name="openseamap"
                  checked={showOpenSeaMap}
                  onChange={(e) => setShowOpenSeaMap(e.target.checked)}
                />
                OpenSeaMap
              </label>
            </div>
          </div>
        </div>
        {map && (
          <BreveMarkers
            map={map}
            onMarkerClick={setSelectedBreveId}
            focusedBreve={focusedBreve}
          />
        )}
        {map && <ZonesLayer map={map} />}
        <div className={styles.breveSectionContainer}>
          <BreveSection
            selectedBreveId={selectedBreveId}
            setSelectedBreveId={setSelectedBreveId}
            setFocusedBreve={setFocusedBreve}
            resetMapView={resetMapView}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Pour tester l'ajout d'autre fon/surcouche via shom ou emodnet :

// import VectorLayer from "ol/layer/Vector";
// import VectorSource from "ol/source/Vector";
// import GeoJSON from "ol/format/GeoJSON";
// import WMTS from "ol/source/WMTS";
// import WMTSTileGrid from "ol/tilegrid/WMTS";

// const [showEpavesObstructions, setShowEpavesObstructions] = useState(false);
// const [showCablesConduites, setShowCablesConduites] = useState(false);
// const [showSarZones, setShowSarZones] = useState(false);

// emodnet_bathy: new TileLayer({
//   source: new TileWMS({
//     url: "https://ows.emodnet-bathymetry.eu/wms",
//     params: {
//       LAYERS: "emodnet:mean_atlas_land",
//       TILED: true,
//       FORMAT: "image/png",
//       TRANSPARENT: true,
//     },
//     attributions: "© EMODnet Bathymetry",
//   }),
//   visible: false,
// }),
// epaves_obstructions: new VectorLayer({
//       source: new VectorSource({
//         url: "https://ows.emodnet-humanactivities.eu/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=wwshipwrecks&outputFormat=application/json",
//         format: new GeoJSON(),
//       }),
//       visible: false,
//       zIndex: 161,
//     }),
//     cables_conduites: new TileLayer({
//       source: new TileWMS({
//         url: "https://services.data.shom.fr/INSPIRE/wms/r",
//         params: {
//           LAYERS: "CABLES_PYR-PNG_WLD_3857_WMSR",
//           TILED: true,
//           FORMAT: "image/png",
//           TRANSPARENT: true,
//         },
//         attributions: "© SHOM",
//       }),
//       visible: false,
//       zIndex: 10,
//     }),
//     sar_zones: new TileLayer({
//       source: new TileWMS({
//         url: "https://services.data.shom.fr/INSPIRE/wms/r",
//         params: {
//           LAYERS: "SAR_PYR_PNG_3857_WMSR",
//           TILED: true,
//           FORMAT: "image/png",
//           TRANSPARENT: true,
//         },
//         attributions: "© SHOM",
//       }),
//       visible: false,
//       zIndex: 10,
//     }),

// baseLayersRef.current.emodnet_bathy,
// baseLayersRef.current.epaves_obstructions,
// baseLayersRef.current.cables_conduites,
// baseLayersRef.current.sar_zones,

// baseLayersRef.current.emodnet_bathy.setVisible(
//   selected === "emodnet_bathy"
// );

// baseLayersRef.current.epaves_obstructions.setVisible(
//   showEpavesObstructions
// );
// baseLayersRef.current.cables_conduites.setVisible(showCablesConduites);
// baseLayersRef.current.sar_zones.setVisible(showSarZones);

// showEpavesObstructions,
// showCablesConduites,
// showSarZones,

//  <label>
//             <input
//               type="radio"
//               name="fond-de-carte"
//               value="emodnet_bathy"
//               checked={baseLayer === "emodnet_bathy"}
//               onChange={() => handleBaseLayerChange("emodnet_bathy")}
//             />
//             emodnet_bathy
//           </label>

//  <label>
//               <input
//                 type="checkbox"
//                 name="epaves_obstructions"
//                 checked={showEpavesObstructions}
//                 onChange={(e) => setShowEpavesObstructions(e.target.checked)}
//               />
//               Épaves/Obstructions
//             </label>
//             <label>
//               <input
//                 type="checkbox"
//                 name="cables_conduites"
//                 checked={showCablesConduites}
//                 onChange={(e) => setShowCablesConduites(e.target.checked)}
//               />
//               Cables/Conduites
//             </label>
//             <label>
//               <input
//                 type="checkbox"
//                 name="sar_zones"
//                 checked={showSarZones}
//                 onChange={(e) => setShowSarZones(e.target.checked)}
//               />
//               Zones SAR (WMTS)
//             </label>
