"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  getFiltres,
  getAllBreves,
  getFilteredBrevesForExport,
} from "../lib/db";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [filters, setFilters] = useState([]);
  const [breves, setBreves] = useState({ content: [] });
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});
  const [needRefresh, setNeedRefresh] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [brevesForExport, setBrevesForExport] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const filtersData = await getFiltres();
        const brevesData = await getAllBreves(0, 10, activeFilters);
        const brevesForExportData = await getFilteredBrevesForExport(
          activeFilters
        );

        setBrevesForExport(brevesForExportData || []);
        setFilters(filtersData || []);
        setBreves(brevesData || { content: [] });
        setHasMore(!brevesData.last);
        setNeedRefresh(false);
        setPage(0);
      } catch (error) {
        console.error("Erreur lors de la récuperation des données", error);
      }
    };
    fetchData();
  }, [activeFilters, needRefresh]);

  const loadMoreBreves = async () => {
    try {
      const nextPage = page + 1;
      const brevesData = await getAllBreves(nextPage, 10, activeFilters);
      setBreves((prevBreves) => ({
        ...brevesData,
        content: [...prevBreves.content, ...brevesData.content],
      }));
      setPage(nextPage);
      setHasMore(!brevesData.last);
    } catch (error) {
      console.error(
        "erreur lors du chargement des brèves supplémentaires",
        error
      );
    }
  };

  return (
    <DataContext.Provider
      value={{
        filters,
        breves,
        loadMoreBreves,
        hasMore,
        activeFilters,
        setActiveFilters,
        userRole,
        setUserRole,
        needRefresh,
        setNeedRefresh,
        brevesForExport,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
