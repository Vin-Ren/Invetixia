import { UserContext } from "../context/UserContext";
import { useContext } from "react";


export default function useUser() {
  return useContext(UserContext)
}
