import { Buffer } from 'buffer';
import axios from "axios";
import useLocalStorage from "./useLocalStorage";
import { AuthData } from "../context/AuthContext";
import { useEffect } from "react";


const parseJwtContent = (token: string) => {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  } catch (e) {
    return null;
  }
};


export default function useAuth() {
  const [auth, setAuth] = useLocalStorage('auth_data', (): AuthData => {
    return { authenticated: false }
  });

  if (parseJwtContent(auth.accessToken)?.exp * 1000 < Date.now()) {
    setAuth({ authenticated: false })
  }

  useEffect(() => {
    if (!(auth.authenticated)) {
      axios.defaults.headers.common['Authorization'] = '';
      return;
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${auth.accessToken}`
  }, [auth])
  return [auth, setAuth]
}
