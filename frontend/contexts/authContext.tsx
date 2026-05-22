import { AuthContextProps, DecodedTokenProps, UserProps } from "@/types";
import { useRouter } from "expo-router";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { login, register } from "@/services/auth.Service";

export const AuthContext = createContext<AuthContextProps>({
  token: null,
  user: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateToken: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProps | null>(null);
  const router = useRouter();

  useEffect(() =>{
    loadToken();
  }, []);

  const loadToken = async () => {
    const storedToken = await AsyncStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedTokenProps>(storedToken);
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          await AsyncStorage.removeItem("token");
          gotoWelcomePage();
          return;
        }
        setToken(storedToken);
        setUser(decoded.user);
        gotoHomePage();
      } catch (error) {
        gotoWelcomePage();
        console.log("failed to load token:", error);
      }
    } else {
      gotoWelcomePage();
    }
  };

  const gotoHomePage = () => {
    setTimeout(() => {
      router.replace("/(main)/home");
    }, 1500);
  };

  const gotoWelcomePage = () => {
    setTimeout(() => {
      router.replace("/welcome");
    }, 1500);
  };

  const updateToken = async (token: string) => {
    setToken(token);

    await AsyncStorage.setItem("token", token);

    const decoded = jwtDecode<DecodedTokenProps>(token);

    console.log("decoded token :", decoded);

    setUser(decoded.user);
  };

  const signIn = async (email: string, password: string) => {
    const response = await login(email, password);

    if (!response) {
      throw new Error("Login failed");
    }

    await updateToken(response.token);
    router.replace("/(main)/home");
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    avatar?: string | null,
  ) => {
    const response = await register(email, password, name, avatar);

    if (!response) {
      throw new Error("Register failed");
    }

    await updateToken(response.token);
    router.replace("/(main)/home");
  };

  const signOut = async () => {
    setToken(null);

    setUser(null);

    await AsyncStorage.removeItem("token");

    router.replace("/welcome");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        signIn,
        signUp,
        updateToken,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
