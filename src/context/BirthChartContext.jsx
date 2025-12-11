import React, { createContext, useContext, useState } from "react";

const BirthChartContext = createContext();
export const useBirthChart = () => useContext(BirthChartContext);

export function BirthChartProvider({ children }) {
  // ❗ ברירת מחדל: הדיאלוג תמיד סגור
  const [profileOpen, setProfileOpen] = useState(false);

  // דיאלוג מפה (אחרי יצירת SVG)
  const [chartOpen, setChartOpen] = useState(false);
  const [chartSvg, setChartSvg] = useState(null);

  // פתח את חלון המפה
  const showChart = (svg) => {
    setChartSvg(svg);
    setChartOpen(true);
  };

  // סגור את חלון המפה
  const hideChart = () => {
    setChartOpen(false);
    setChartSvg(null);
  };

  const value = {
    profileOpen,
    setProfileOpen,

    chartOpen,
    chartSvg,
    showChart,
    hideChart,
  };

  return (
    <BirthChartContext.Provider value={value}>
      {children}
    </BirthChartContext.Provider>
  );
}
