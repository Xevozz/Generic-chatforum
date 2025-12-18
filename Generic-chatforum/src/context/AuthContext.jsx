// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { subscribeToAuthChanges, logout as logoutFn } from "../services/authService";
import { getUserByUid, updateLastActive } from "../services/userService";
import { db } from "../firebaseConfig";
import { onSnapshot, doc } from "firebase/firestore";

const AuthContext = createContext(null);

// Standardtema
const DEFAULT_THEME = {
  name: "Hvid (Standard)",
  primaryColor: "#ffffff",
  accentColor: "#007bff",
  cardBgColor: "#ffffff",
  cardBorderColor: "#e5e7eb",
  textPrimary: "#222",
  textSecondary: "#666",
  buttonBg: "#2563eb",
  buttonHoverBg: "#1d4ed8",
  navbarBg: "#ffffff",
  borderColor: "#d1d5db",
  inputBg: "#f9fafb",
  inputBorder: "#c1c1c1",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Firebase Auth user
  const [profile, setProfile] = useState(null); // Firestore brugere profil
  const [loading, setLoading] = useState(true);

  // Anvend tema globalt med alle CSS variabler
  const applyTheme = (theme) => {
    const themeToApply = theme || DEFAULT_THEME;
    document.documentElement.style.setProperty("--primary-color", themeToApply.primaryColor);
    document.documentElement.style.setProperty("--accent-color", themeToApply.accentColor);
    document.documentElement.style.setProperty("--card-bg-color", themeToApply.cardBgColor);
    document.documentElement.style.setProperty("--card-border-color", themeToApply.cardBorderColor);
    document.documentElement.style.setProperty("--text-primary", themeToApply.textPrimary);
    document.documentElement.style.setProperty("--text-secondary", themeToApply.textSecondary);
    document.documentElement.style.setProperty("--button-bg", themeToApply.buttonBg);
    document.documentElement.style.setProperty("--button-hover-bg", themeToApply.buttonHoverBg);
    document.documentElement.style.setProperty("--navbar-bg", themeToApply.navbarBg);
    document.documentElement.style.setProperty("--border-color", themeToApply.borderColor);
    document.documentElement.style.setProperty("--input-bg", themeToApply.inputBg);
    document.documentElement.style.setProperty("--input-border", themeToApply.inputBorder);
  };

  useEffect(() => {
    // Tjekker for login / logout
    const unsubscribe = subscribeToAuthChanges(async (authUser) => {
      setUser(authUser);

      if (authUser) {
        // Setup real-time listener til profil-ændringer
        const userDocRef = doc(db, "users", authUser.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setProfile(userData);
            // Anvend tema når profil ændres (inkl. tema-ændringer)
            applyTheme(userData?.theme);
          }
        });

        setLoading(false);
        
        // Cleanup listener når komponent unmountes
        return unsubscribeProfile;
      } else {
        setProfile(null);
        // Nulstil tema til standard
        applyTheme(DEFAULT_THEME);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Anvend tema ved opstart hvis ingen bruger
  useEffect(() => {
    if (!loading && !user) {
      applyTheme(DEFAULT_THEME);
    }
  }, [loading, user]);

  // Opdater lastActive hver 2. minut når bruger er logget ind
  useEffect(() => {
    if (!user?.uid) return;

    // Opdater med det samme
    updateLastActive(user.uid);

    // Opdater hver 2. minut
    const interval = setInterval(() => {
      updateLastActive(user.uid);
    }, 120000);

    return () => clearInterval(interval);
  }, [user?.uid]);

  const value = {
    user,
    profile,
    loading,
    logout: logoutFn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook til at bruge auth alle steder
export function useAuth() {
  return useContext(AuthContext);
}