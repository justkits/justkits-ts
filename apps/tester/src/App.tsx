import "./App.css";
import axios from "axios";
import { AuthProvider } from "@justkits/auth";
import { Fallback } from "./Fallback";

function App() {
  const axiosInstance = axios.create();

  const tokenRefreshAPICall = async () => {
    // 인위적으로 3초 지연
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const response = await axiosInstance.post("/auth/refresh-token");

    return response.data;
  };

  return (
    <AuthProvider
      tokenRefreshAPICall={tokenRefreshAPICall}
      instance={axiosInstance}
      fallback={<Fallback />}
    >
      <div className="App">
        <h1>JustKits Tester App</h1>
      </div>
    </AuthProvider>
  );
}

export default App;
