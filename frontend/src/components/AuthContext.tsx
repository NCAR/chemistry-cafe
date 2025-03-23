import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useLayoutEffect,
} from "react";
import { APIUser } from "../API/API_Interfaces";
import { getGoogleAuthUser } from "../API/API_GetMethods";
import { createUser } from "../API/API_CreateMethods";

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
    const getUser = async () => {
      const storedUser: string | null = localStorage.getItem("user");
      let userInfo: APIUser | null = storedUser ? JSON.parse(storedUser) : null;

      const authInfo = await getGoogleAuthUser();
      if (
        authInfo?.email &&
        (!userInfo || userInfo?.email != authInfo?.email)
      ) {
        userInfo = await createUser({
          // TODO Move this functionality to the backend on sign-in
          username: "Default Username",
          role: "unverified",
          email: authInfo?.email,
          google_id: authInfo.nameId,
        });
        setUser(userInfo);
        localStorage.setItem("user", JSON.stringify(userInfo));
      } else if (!authInfo?.nameId) {
        setUser(null);
        localStorage.removeItem("user");
      } else {
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
