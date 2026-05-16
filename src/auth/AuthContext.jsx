import { createContext, useState, useContext, useEffect } from "react";
// import { AuthUser } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";

export const defaultProvider = {
  user: null,
  setUser: () => null,
  isAuthLoading: false,
  handleLogout: () => { },
};

export const AuthContext = createContext(defaultProvider);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setIsAuthLoading(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session error:", error)
          setUser(null)
          setSession(null)
          return
        }

        const session = data.session;
        setSession(session)
        setUser(session?.user ?? null)

      } catch (error) {
        console.error("Auth error:", error)
        setUser(null)
      } finally {
        setIsAuthLoading(false)
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("event", _event);
      console.log("session", session);
      setSession(session);
      setUser(session?.user ?? null)
      if (!session) {
        setUser(null);
        navigate("/login");
        return;
      }
      // setUser(session.user);

      if (_event === "SIGNED_IN" && window.location.pathname === "/login") {
        navigate("/")
      }
    });


    // const savedUser = localStorage.getItem("user");
    // if (savedUser) {
    //   const userData = JSON.parse(savedUser);

    //   // Ensure the user has savedProperties (initialize as empty array if not present)
    //   if (!userData.savedProperties) {
    //     userData.savedProperties = [];
    //   }

    //   setUser(userData);
    // }
    return () => subscription.unsubscribe();
  }, []);

  // const login = async (email, password) => {
  //   try {
  //     const res = await fetch(`http://localhost:5000/users?email=${email}&password=${password}`);
  //     const data = await res.json();

  //     if (data.length > 0) {
  //       const loggedInUser = data[0];

  //       // Make sure savedProperties is initialized
  //       if (!loggedInUser.savedProperties) {
  //         loggedInUser.savedProperties = []; // Initialize if not already present
  //       }

  //       setUser(loggedInUser);
  //       localStorage.setItem("user", JSON.stringify(loggedInUser));
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } catch (error) {
  //     console.error("Login failed:", error);
  //     return false;
  //   }
  // };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  var value = {
    user,
    setUser,
    isAuthLoading,
    handleLogout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
