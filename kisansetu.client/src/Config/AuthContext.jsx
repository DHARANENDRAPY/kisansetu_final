
import { createContext, useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      try {
        const decoded = jwtDecode(token);
        const email = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || decoded.email || decoded.upn || decoded.preferred_username;

        return { token, email, role };
      } catch (error) {
        console.error("Invalid token:", error);
        return null; // Clear invalid token
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!user);

  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  const login = (token, role) => {
    try {
      const decoded = jwtDecode(token);
      const email = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || decoded.email || decoded.upn || decoded.preferred_username;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      setUser({ token, email, role });
    } catch (error) {
      console.error("Token decoding error:", error);
    }
  };

  const signup = async (email, password, role) => {
    try {
      const response = await fetch("http://localhost:7087/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      if (response.ok) {
        login(data.token, data.role);
      } else {
        throw new Error(data.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      alert(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
