/**
 * Location context - delivery location/pincode for Zomato-style location-based ordering
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'teato_location';

function loadLocation() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocationState] = useState(loadLocation);

  const setLocation = useCallback((loc) => {
    setLocationState(loc);
    if (loc) localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation, pincode: location?.pincode }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
