import { createContext } from "react";

export interface AuthData {
  authenticated: boolean,
  username?: string,
  accessToken?: string,
  role?: string,
  organisationManaged?: string
}

export const AuthContext = createContext<{ auth: AuthData, setAuth: Function }>(null as any);
