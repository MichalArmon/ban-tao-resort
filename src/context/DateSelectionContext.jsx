import React, { createContext, useContext, useState, useCallback } from "react";

const DateSelectionContext = createContext();

/**
 * 🎯 Hook לצריכת הסטייט של התאריכים והאורחים הנבחרים.
 *
 * @returns {object} הסטייט והפונקציות של הבחירה
 */
export const useDateSelection = () => useContext(DateSelectionContext);

/**
 * 📅 קונטקסט מרכזי לניהול סטייט התאריכים והאורחים (Check-in/out, Guests).
 *
 * סטייט זה משמש כמסנן ראשי הן לחדרים והן לסדנאות.
 */
export const DateSelectionProvider = ({ children }) => {
  // 🛌 סטייט לחדרים (טווח תאריכים)
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [roomsCount, setRoomsCount] = useState(1);

  // 🧘 סטייט לסדנאות (תאריך ושעה ספציפיים)
  const [selectedSessionDate, setSelectedSessionDate] = useState(null);

  const value = {
    // Rooms & General
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    roomsCount,
    setRoomsCount,

    // Sessions Specific
    selectedSessionDate,
    setSelectedSessionDate,
  };

  return (
    <DateSelectionContext.Provider value={value}>
      {children}
    </DateSelectionContext.Provider>
  );
};
