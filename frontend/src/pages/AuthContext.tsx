import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useLayoutEffect,
} from "react";
import { User } from "../API/API_Interfaces";
import { getGoogleAuthUser, getUserByEmail } from "../API/API_GetMethods";

// Define the shape of the AuthContext
interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

// Create the context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useLayoutEffect(() => {
    const getUser = async () => {
      const storedUser: string | null = localStorage.getItem("user");
      let userInfo: User | null = storedUser ? JSON.parse(storedUser) : null;

      const authInfo = await getGoogleAuthUser();
      if (authInfo?.email && (!userInfo || userInfo?.email != authInfo?.email)) {
        userInfo = await getUserByEmail(authInfo?.email);
        setUser(userInfo);
        localStorage.setItem("user", JSON.stringify(userInfo));
      }
      else if (!authInfo?.nameId) {
        setUser(null);
        localStorage.removeItem("user");
      }
      else {
        setUser(userInfo);
      }
    };

    getUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
