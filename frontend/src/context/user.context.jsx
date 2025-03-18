import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from local storage (if available)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ email: "example@gmail.com", name: "John Doe" });
    }
  }, []);

  const loginUser = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
