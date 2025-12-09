// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { subscribeToAuthChanges, logout as logoutFn } from "../services/authService";
import { getUserByUid } from "../services/userService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Firebase Auth user
  const [profile, setProfile] = useState(null); // Firestore brugere profil
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tjekker for  login / logout
    const unsubscribe = subscribeToAuthChanges(async (authUser) => {
      setUser(authUser);

      if (authUser) {
        // Hent profil fra Firestore (displayName, isAdmin osv.)
        const doc = await getUserByUid(authUser.uid);
        setProfile(doc);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

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