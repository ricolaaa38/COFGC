"use client";

import Header from "../components/header";
import Footer from "../components/footer";
import styles from "./page.module.css";
import { useEffect, useState, useMemo } from "react";
import {
  getApplicationViews,
  getApplicationViewsByPeriod,
  getApplicationViewsByWeekDayMonthYear,
} from "../lib/db";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Brush,
} from "recharts";

export default function Statistiques() {
  const [dataForChart, setDataForChart] = useState([]);
  const [periodFirstChart, setPeriodFirstChart] = useState("perDay");
  const [periodSecondChart, setPeriodSecondChart] = useState("perMonth");
  const [dataForWeekDayMonthYear, setDataForWeekDayMonthYear] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getApplicationViews();
        const dataPeriod = await getApplicationViewsByPeriod();
        const dataWeekDayMonthYear =
          await getApplicationViewsByWeekDayMonthYear();
        setDataForChart(dataPeriod);
        setDataForWeekDayMonthYear(dataWeekDayMonthYear);
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
    return years.sort((a, b) => a - b);
  })();

  const comparisonDataFirstChart = useMemo(
    () => buildYearComparison(periodFirstChart, availableYears),
    [periodFirstChart, availableYears, dataForChart]
  );
  const comparisonDataSecondChart = useMemo(
    () => buildYearComparison(periodSecondChart, availableYears),
    [periodSecondChart, availableYears, dataForChart]
  );

  const brushRangeFirst = useMemo(() => {
    const len = comparisonDataFirstChart.length || 0;
    const lastN = 30;
    const startIndex = Math.max(0, len - lastN);
    const endIndex = Math.max(0, len - 1);
    return { startIndex, endIndex };
  }, [comparisonDataFirstChart]);

  const handleFirstChartPeriodChange = (newPeriod) => {
    setPeriodFirstChart(newPeriod);
  };
  const handleSecondChartPeriodChange = (newPeriod) => {
    setPeriodSecondChart(newPeriod);
  };

  const transformWeekDayMonthYear = (obj) => {
    if (!obj) return [];
    const dayNames = {
      1: "lundi",
      2: "mardi",
      3: "mercredi",
      4: "jeudi",
      5: "vendredi",
      6: "samedi",
      7: "dimanche",
    };

    const map = {};

    Object.entries(obj).forEach(([key, value]) => {
      const parts = String(key).split("-");
      if (parts.length !== 2) return;
      const [yearStr, dowStr] = parts;
      const year = Number(yearStr);
      if (Number.isNaN(year)) return;
      const dayKey = dayNames[dowStr] || `d${dowStr}`;

      if (!map[year]) {
        map[year] = {
          année: year,
          week: {
            lundi: 0,
            mardi: 0,
            mercredi: 0,
            jeudi: 0,
            vendredi: 0,
            samedi: 0,
            dimanche: 0,
          },
        };
      }

      map[year].week[dayKey] = value;
    });

    return Object.values(map).sort((a, b) => a.année - b.année);
  };

  const weekDataByYear = useMemo(
    () => transformWeekDayMonthYear(dataForWeekDayMonthYear),
    [dataForWeekDayMonthYear]
  );

  const dayOrder = [
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
    "dimanche",
  ];
  const cap = (s) =>
    typeof s === "string" ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  const chartDataDays = useMemo(() => {
    const yearMap = new Map(
      (weekDataByYear || []).map((w) => [w.année, w.week || {}])
    );
    return dayOrder.map((day) => {
      const row = { day: cap(day) };
      (availableYears || []).forEach((year) => {
        const week = yearMap.get(year) || {};
        row[`y${year}`] = week[day] ?? 0;
      });
      return row;
    });
  }, [weekDataByYear, availableYears]);

  return (
    <div id={styles.statistiquesPage}>
      <Header />
      <div className={styles.statistiquesContent}>
        <h2>Statistiques</h2>
        <div className={styles.statistiquesCharts}>
          <div className={styles.statistiquesChart}>
            <div className={styles.chartHeader}>
              <h3>Nombre total de connexions :</h3>
              <div className={styles.chartSelectionButton}>
                <button
                  onClick={() => handleFirstChartPeriodChange("perDay")}
                  className={periodFirstChart === "perDay" ? styles.active : ""}
                >
                  Journalier
                </button>
                <button
                  onClick={() => handleFirstChartPeriodChange("perWeek")}
                  className={
                    periodFirstChart === "perWeek" ? styles.active : ""
                  }
                >
                  Hebdomadaire
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={comparisonDataFirstChart}>
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
                <Brush
                  startIndex={brushRangeFirst.startIndex}
                  endIndex={brushRangeFirst.endIndex}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.statistiquesChart}>
            <div className={styles.chartHeader}>
              <h3>Nombre total de connexions :</h3>
              <div className={styles.chartSelectionButton}>
                <button
                  onClick={() => handleSecondChartPeriodChange("perMonth")}
                  className={
                    periodSecondChart === "perMonth" ? styles.active : ""
                  }
                >
                  Mensuel
                </button>
                <button
                  onClick={() => handleSecondChartPeriodChange("perYear")}
                  className={
                    periodSecondChart === "perYear" ? styles.active : ""
                  }
                >
                  Annuel
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={comparisonDataSecondChart}>
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
                    <Bar
                      key={year}
                      dataKey={`y${year}`}
                      name={`${year}`}
                      fill={colorPalette[i % colorPalette.length]}
                      barSize={20}
                    />
                  );
                })}
                <Brush />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.statistiquesChart}>
            <div className={styles.chartHeader}>
              <h3>
                Nombre total de connexions en fonctions du jour de la semaine
                par années:
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                // layout="vertical"
                data={chartDataDays}
                margin={{ left: 20, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <YAxis type="number" />
                <XAxis dataKey="day" type="category" width={140} />
                <Tooltip />
                <Legend />
                {(availableYears || []).map((year, i) => {
                  const colorPalette = [
                    "#8884d8",
                    "#82ca9d",
                    "#ff7300",
                    "#413ea0",
                    "#a8328e",
                    "#4caf50",
                    "#ffbb28",
                  ];
                  return (
                    <Bar
                      key={year}
                      dataKey={`y${year}`}
                      name={`${year}`}
                      fill={colorPalette[i % colorPalette.length]}
                      barSize={12}
                    />
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
