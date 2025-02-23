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
  const [user, setUser] = useState<User | null>(() => {
    // Retrieve user from localStorage if it exists
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useLayoutEffect(() => {
    const getUser = async () => {
      if (!user) {
        const authInfo = await getGoogleAuthUser();
        if (authInfo?.email) {
          setUser(await getUserByEmail(authInfo?.email));
        }
      }
    };

    getUser();
  }, [user]);

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
