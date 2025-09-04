import axios from "axios";
import { useEffect, useState } from "react";

interface HelloResponse {
  data: string;
}

export default function App() {
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchHello = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
        const response = await axios.get<HelloResponse>(
          `${apiUrl}/hello/world`
        );
        setMessage(response.data.data);
      } catch (err) {
        setError(
          "Error fetching message: " +
            (err instanceof Error ? err.message : "Unknown error")
        );
      }
    };

    fetchHello();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Open File Sharing</h1>
        {error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <p>{message || "Loading..."}</p>
        )}
      </header>
    </div>
  );
}
