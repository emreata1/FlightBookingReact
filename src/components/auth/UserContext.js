import { createContext, useState, useContext } from 'react';

export const UserContext = createContext({
  user: null, 
  setUser: () => {} 
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);


