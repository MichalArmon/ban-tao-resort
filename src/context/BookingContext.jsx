// src/context/BookingContext.jsx

import React, { createContext, useContext, useState, useCallback } from "react";

const BookingContext = createContext();
const API_BASE_URL = "http://localhost:3000/api/v1/bookings";

// Custom hook to use the booking context
export const useBooking = () => {
  return useContext(BookingContext);
};

export const BookingProvider = ({ children }) => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);

  // --- Core Fetch Function: Check Availability ---
  const fetchAvailability = useCallback(async () => {
    if (!checkIn || !checkOut || guests < 1 || rooms < 1) {
      setError("Please select valid dates, guests, and rooms.");
      return;
    }

    if (!checkIn || !checkOut) {
      setError("Please select both Check-In and Check-Out dates.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage("");
    setAvailableRooms([]);

    try {
      const url = `${API_BASE_URL}/availability?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&rooms=${rooms}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch availability.");
      }

      setAvailableRooms(data.availableRooms);
      setMessage(data.message || "");
    } catch (err) {
      console.error("Availability check failed:", err);
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
      setAvailableRooms([]);
    } finally {
      setLoading(false);
    }
  }, [checkIn, checkOut, guests, rooms]); // Dependency on dates ensures the function uses current state

  // --- Core Fetch Function: Get Quote ---
  const fetchQuote = async (roomType, currentCheckIn, currentCheckOut) => {
    // This function will be called by RoomQuote component
    try {
      const response = await fetch(`${API_BASE_URL}/get-quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIn: currentCheckIn, // Use local dates passed from RoomQuote for precision
          checkOut: currentCheckOut,
          roomType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get quote.");
      }
      return data; // Returns {totalPrice, isRetreatPrice}
    } catch (error) {
      console.error("Quote fetch failed:", error);
      throw error;
    }
  };

  // --- Context Value ---
  const value = {
    // State
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    availableRooms,
    loading,
    error,
    message,
    guests,
    setGuests,
    rooms,
    setRooms,
    // Functions
    fetchAvailability,
    fetchQuote, // Exporting the fetchQuote utility
    // Note: You can add createBooking here later
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};
