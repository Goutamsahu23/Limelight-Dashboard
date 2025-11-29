import { useEffect, useState, useRef } from "react";

export function useDeviceStream(url) {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastMessageAt, setLastMessageAt] = useState(null);
  const bufferRef = useRef([]);

  useEffect(() => {
    if (!url) return;

    // IMPORTANT: don't accumulate infinite connections
    const es = new EventSource(url);

    es.onopen = () => {
      console.log("SSE connected");
      setConnected(true);
      setError(null);
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        const MAX_RECORDS = 1800; // 30 minutes at 1 Hz (30 * 60)

        bufferRef.current.push(data);

        if (bufferRef.current.length > MAX_RECORDS) {
          // remove oldest items
          bufferRef.current.splice(
            0,
            bufferRef.current.length - MAX_RECORDS
          );
        }

        setRecords([...bufferRef.current]);
        setLastMessageAt(Date.now());
      } catch (err) {
        console.error("Error parsing SSE data:", err);
        setError("Failed to parse incoming data");
      }
    };

    es.onerror = (err) => {
      console.error("SSE error:", err);
      setError("Connection error");
      setConnected(false);

    };

    return () => {
      console.log("Closing SSE connection");
      es.close();
    };
  }, [url]);

  return { records, error, connected, lastMessageAt };
}
