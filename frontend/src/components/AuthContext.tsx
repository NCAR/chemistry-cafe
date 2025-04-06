import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useLayoutEffect,
} from "react";
import { APIUser } from "../API/API_Interfaces";
import { getCurrentUser } from "../API/API_GetMethods";

// Define the shape of the AuthContext
interface AuthContextProps {
  user: APIUser | null;
  setUser: (user: APIUser | null) => void;
}

// Create the context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<APIUser | null>(null);

  useLayoutEffect(() => {
    const abortController = new AbortController();
    const getUser = async () => {
      try {
        let userInfo: APIUser | null = await getCurrentUser();
        setUser(userInfo);
      } catch (err) {
        if (!abortController.signal.aborted) {
          console.error(err);
        }
      }
    };

    getUser();

    return () => abortController.abort();
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
