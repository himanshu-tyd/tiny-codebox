import { ChangeEvent, useEffect, useState } from "react";

const App = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [userMessage, setUserMessage] = useState<string | null>("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000");

    ws.onopen = () => {
      setSocket(ws);

      ws.onmessage = (message) => {
        setMessages((msgs) => [...msgs, message.data]);
      };
    };


    return ()=> ws.close()

  }, []);

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userMessage) return;

    socket?.send(userMessage);

    setUserMessage("");
  };

  if (!socket) {
    return <div>Connecting to server...</div>;
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
        {messages.map((message) => (
          <span key={message}>{message}</span>
        ))}
      </div>

      <form onSubmit={handleSendMessage}>
        <input
          style={{ width: "100%" }}
          type="text"
          placeholder="Type Message..."
          value={userMessage ?? ""}
          onChange={(e) => setUserMessage(e.target.value)}
        />
        <button type="submit">Send message</button>
      </form>
    </div>
  );
};

export default App;

