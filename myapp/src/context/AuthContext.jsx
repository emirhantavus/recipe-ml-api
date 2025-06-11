import { createContext, useState, useEffect } from "react";
//createContext: Önemli verilerin her yerde ulaşılabilir olmasını sağlar.

export const AuthContext = createContext();//kimlik bilgilerini tutan bir context

export const AuthProvider = ({ children }) => {//AuthProvider'ın açılış ve kapanış etiketi arasına yazdığın her şey--children
  const [user, setUser] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      setUser(true); // Eğer token varsa giriş yapılmış kabul eder.
    }
  }, []);

  const logoutUser = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };
//önemli bilgileri kapsanan tüm componentlere aktarılır.
  return (                  //context ile paylaşılan değerler
    <AuthContext.Provider value={{ user, setUser, logoutUser }}> 
      {children}
    </AuthContext.Provider>
  );
};

