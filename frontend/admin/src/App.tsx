import { AuthContext } from "./context/AuthContext";
import useAuth from "./hooks/useAuth";


function App() {
  const [auth, setAuth] = useAuth();

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <p>Hi</p>
    </AuthContext.Provider>
  )
}

export default App
