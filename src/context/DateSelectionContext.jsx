import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useBooking } from "./BookingContext";
import moment from "moment";

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
  const { selection } = useBooking();

  // 🧘 סטייט לסדנאות (תאריך ושעה ספציפיים)
  const [selectedSessionDate, setSelectedSessionDate] = useState(null); // 🟢 לוגיקת אתחול: טען את נתוני החדרים מה-selection בפעם הראשונה // ------------------------------------------------------------------

  // ------------------------------------------------------------------
  useEffect(() => {
    // הפעל רק אם יש selection מסוג 'room' וזהו האתחול הראשון
    if (
      selection?.type === "room" &&
      selection?.checkIn &&
      selection?.checkOut
    ) {
      // ⚠️ חשוב: אנו מניחים שהתאריכים נשמרו כפורמט Moment או מחרוזת ISO ב-BookButton
      // אנו משתמשים ב-Moment כאן, יש לוודא שהוא מיובא או להשתמש בפורמט התואם
      // אם התאריך נשמר כמחרוזת ISO, נוכל להשתמש ב-new Moment()

      setCheckIn(moment(selection.checkIn));
      setCheckOut(moment(selection.checkOut));
      setGuests(selection.guests || 1);
      setRoomsCount(selection.roomsCount || 1); // מונע הרצה חוזרת לאחר שהסטייט אוכלס // נסמן כאן שסיימנו את האתחול

      console.log(
        "📅 DateSelectionContext initialized from Booking Selection."
      );
    } // [selection] - עשוי לגרום לבעיות אם selection משתנה לעיתים קרובות
  }, [selection]); // שינוי selection יפעיל את האתחול

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
