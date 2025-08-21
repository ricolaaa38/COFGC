"use client";

import Header from "../components/header";
import Footer from "../components/footer";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { getApplicationViews, getApplicationViewsByPeriod } from "../lib/db";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Brush,
} from "recharts";

export default function Statistiques() {
  const [dataForChart, setDataForChart] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getApplicationViews();
        const dataPeriod = await getApplicationViewsByPeriod();
        setDataForChart(dataPeriod);
        console.log("Data for chart:", dataPeriod);
      } catch (error) {
        console.error("Error fetching application views:", error);
      }
    };

    fetchData();
  }, []);

  const normalizeList = (list) => {
    if (!list) return [];
    if (!Array.isArray(list)) {
      return Object.entries(list).map(([date, value]) => ({
        date,
        views: value,
      }));
    }
    return list
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        if ("date" in item && "views" in item)
          return { date: item.date, views: item.views };
        const keys = Object.keys(item);
        if (keys.length === 1) {
          const date = keys[0];
          return { date, views: item[date] };
        }
        return null;
      })
      .filter(Boolean);
  };

  const extractYear = (dateStr) => {
    if (!dateStr) return null;
    if (typeof dateStr === "string" && dateStr.length >= 4) {
      const y = Number(dateStr.slice(0, 4));
      return Number.isNaN(y) ? null : y;
    }
    const d = new Date(dateStr);
    return Number.isNaN(d.getFullYear()) ? null : d.getFullYear();
  };

  const formattedData = (period = "perDay", year) => {
    const list = dataForChart?.[period];
    const normalized = normalizeList(list);
    const filtered =
      typeof year !== "undefined"
        ? normalized.filter((d) => extractYear(d.date) === Number(year))
        : normalized;
    return filtered.sort((a, b) =>
      String(a.date).localeCompare(String(b.date))
    );
  };

  const formattedAll = (year) => {
    return {
      perDay: formattedData("perDay", year),
      perWeek: formattedData("perWeek", year),
      perMonth: formattedData("perMonth", year),
      perYear: formattedData("perYear", year),
    };
  };

  const getLabelForPeriod = (dateStr, period = "perDay") => {
    if (!dateStr) return "";

    const getISOWeekLabel = (d) => {
      const date = new Date(d.getTime());
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
      const week1 = new Date(date.getFullYear(), 0, 4);
      const weekNo =
        1 +
        Math.round(
          ((date - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
        );
      return `W${String(weekNo).padStart(2, "0")}`;
    };

    if (period === "perDay") {
      if (typeof dateStr === "string" && dateStr.length >= 10)
        return dateStr.slice(5);
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return String(dateStr);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${mm}-${dd}`;
    }

    if (period === "perMonth") {
      if (typeof dateStr === "string" && dateStr.length >= 7)
        return dateStr.slice(5, 7);
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return String(dateStr);
      return String(d.getMonth() + 1).padStart(2, "0");
    }

    if (period === "perYear") {
      if (typeof dateStr === "string" && dateStr.length >= 4)
        return dateStr.slice(0, 4);
      const d = new Date(dateStr);
      return Number.isNaN(d.getFullYear())
        ? String(dateStr)
        : String(d.getFullYear());
    }

    if (typeof dateStr === "string") {
      const wIndex = dateStr.indexOf("-W");
      if (wIndex !== -1) return dateStr.slice(wIndex + 1);
      const match = dateStr.match(/W?(\d{1,2})$/);
      if (match) return `W${String(match[1]).padStart(2, "0")}`;
    }
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return String(dateStr);
    return getISOWeekLabel(d);
  };

  const buildYearComparison = (period = "perDay", years = []) => {
    const maps = {};
    years.forEach((y) => {
      const arr = formattedData(period, y);
      maps[y] = new Map(
        arr.map((item) => [getLabelForPeriod(item.date, period), item.views])
      );
    });

    const labelsSet = new Set();
    years.forEach((y) => {
      maps[y].forEach((_, k) => labelsSet.add(k));
    });

    const labels = Array.from(labelsSet).sort();

    return labels.map((label) => {
      const row = { label };
      years.forEach((y) => {
        row[`y${y}`] = maps[y].has(label) ? maps[y].get(label) : 0;
      });
      return row;
    });
  };

  const availableYears = (() => {
    const list = normalizeList(dataForChart?.perYear);
    const years = Array.from(
      new Set(
        list
          .map((item) => extractYear(item.date))
          .filter((y) => Number.isFinite(y))
      )
    );
    return years.sort((a, b) => b - a);
  })();

  const comparisonData = buildYearComparison("perDay", availableYears);
  console.log("Comparison Data:", comparisonData);

  return (
    <div id={styles.statistiquesPage}>
      <Header />
      <div className={styles.statistiquesContent}>
        <h2>Statistiques</h2>
        <div className={styles.statistiquesCharts}>
          <div className={styles.statistiquesChart}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={buildYearComparison("perDay", availableYears)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                {availableYears.map((year, i) => {
                  const colorPalette = [
                    "#8884d8",
                    "#82ca9d",
                    "#ff7300",
                    "#413ea0",
                  ];
                  return (
                    <Line
                      key={year}
                      type="monotone"
                      dataKey={`y${year}`}
                      name={`${year}`}
                      stroke={colorPalette[i % colorPalette.length]}
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                      dot={false}
                    />
                  );
                })}
                <Brush />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.statistiquesChart}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={buildYearComparison("perWeek", availableYears)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                {availableYears.map((year, i) => {
                  const colorPalette = [
                    "#8884d8",
                    "#82ca9d",
                    "#ff7300",
                    "#413ea0",
                  ];
                  return (
                    <Line
                      key={year}
                      type="monotone"
                      dataKey={`y${year}`}
                      name={`${year}`}
                      stroke={colorPalette[i % colorPalette.length]}
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                      dot={false}
                    />
                  );
                })}
                <Brush />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.statistiquesChart}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={buildYearComparison("perMonth", availableYears)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                {availableYears.map((year, i) => {
                  const colorPalette = [
                    "#8884d8",
                    "#82ca9d",
                    "#ff7300",
                    "#413ea0",
                  ];
                  return (
                    <Line
                      key={year}
                      type="monotone"
                      dataKey={`y${year}`}
                      name={`${year}`}
                      stroke={colorPalette[i % colorPalette.length]}
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                      dot={false}
                    />
                  );
                })}
                <Brush />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.statistiquesChart}>
            <ResponsiveContainer width="100%" height={400}>
              {/* <LineChart data={buildYearComparison("perYear", availableYears)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                {availableYears.map((year, i) => {
                  const colorPalette = [
                    "#8884d8",
                    "#82ca9d",
                    "#ff7300",
                    "#413ea0",
                  ];
                  return (
                    <Line
                      key={year}
                      type="monotone"
                      dataKey={`y${year}`}
                      name={`${year}`}
                      stroke={colorPalette[i % colorPalette.length]}
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                      dot={false}
                    />
                  );
                })}
                <Brush />
              </LineChart> */}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
