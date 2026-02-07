import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      
      // Ensure the user has savedProperties (initialize as empty array if not present)
      if (!userData.savedProperties) {
        userData.savedProperties = [];
      }
      
      setUser(userData);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`http://localhost:5000/users?email=${email}&password=${password}`);
      const data = await res.json();

      if (data.length > 0) {
        const loggedInUser = data[0];

        // Make sure savedProperties is initialized
        if (!loggedInUser.savedProperties) {
          loggedInUser.savedProperties = []; // Initialize if not already present
        }

        setUser(loggedInUser);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
