import React, { useState, useRef, useEffect } from "react";

const ChatMain = ({ voiceMessages = [], onSendTextMessage }) => {
  const [messages, setMessages] = useState([
    { from: "eva", text: "¡Hola! Soy Eva. Puedes hablarme por voz o escribir aquí.", type: "text" }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Merge voice messages with text messages
  useEffect(() => {
    console.log('📢 voiceMessages changed:', voiceMessages);
    console.log('📢 current messages:', messages);
    
    if (voiceMessages.length > 0) {
      // Process all voice messages that aren't already in chat
      const newMessagesToAdd = voiceMessages.filter(voiceMsg => {
        const messageExists = messages.some(msg => 
          msg.timestamp === voiceMsg.timestamp && 
          msg.type === voiceMsg.type &&
          msg.from === voiceMsg.from
        );
        return !messageExists;
      });

      if (newMessagesToAdd.length > 0) {
        console.log('💬 Adding voice messages to chat:', newMessagesToAdd);
        setMessages(prev => [...prev, ...newMessagesToAdd]);
      }
    }
  }, [voiceMessages]); // Keep only voiceMessages in dependency

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const userMsg = { 
      from: "user", 
      text: newMessage, 
      type: "text",
      timestamp: new Date().toISOString()
    };
    
    setMessages((msgs) => [...msgs, userMsg]);
    setNewMessage("");
    setLoading(true);
    setTyping(true);

    try {
      const response = await fetch("http://localhost:3001/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text, userId: "gaston" }),
      });
      const data = await response.json();
      
      const evaResponse = {
        from: "eva", 
        text: data.response || "No entendí, ¿puedes repetir?",
        type: "text",
        timestamp: new Date().toISOString()
      };
      
      setMessages((msgs) => [...msgs, evaResponse]);

      // Notify parent about text message (for voice component context)
      if (onSendTextMessage) {
        onSendTextMessage(userMsg.text, evaResponse.text);
      }

    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { 
          from: "eva", 
          text: "Ocurrió un error al contactar a Eva.",
          type: "error",
          timestamp: new Date().toISOString()
        }
      ]);
    }
    setLoading(false);
    setTyping(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('✅ Copied to clipboard:', text);
    });
  };

  const getMessageIcon = (msg) => {
    if (msg.type === "voice") {
      return msg.from === "user" ? "🎤" : "🔊";
    }
    return msg.from === "user" ? "💬" : "🤖";
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 16px #0001",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 480,
        maxHeight: 700,
        overflow: "hidden"
      }}
    >
      <div
        style={{
          padding: "20px 24px 12px 24px",
          borderBottom: "1px solid #f0f0f0",
          fontWeight: 700,
          fontSize: "1.25rem",
          color: "#667eea",
          letterSpacing: 1,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}
      >
        <span>💬</span>
        Chat Unificado
        <span style={{ fontSize: "0.8rem", color: "#999", fontWeight: 400 }}>
          (Texto + Voz)
        </span>
      </div>
      
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 24px",
          background: "#f8fafd"
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
              marginBottom: 12
            }}
          >
            <div
              style={{
                background: msg.from === "user" ? "#667eea" : "#fff",
                color: msg.from === "user" ? "#fff" : "#222",
                borderRadius: 14,
                padding: "12px 16px",
                maxWidth: 320,
                boxShadow: msg.from === "eva" ? "0 1px 6px #667eea11" : "none",
                fontSize: "1.05rem",
                lineHeight: 1.5,
                position: "relative",
                border: msg.type === "voice" ? "2px solid #ff1744" : "none"
              }}
            >
              {/* Message type indicator */}
              <div 
                style={{
                  fontSize: "0.7rem",
                  opacity: 0.7,
                  marginBottom: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                {getMessageIcon(msg)}
                {msg.type === "voice" ? "Voz" : "Texto"}
                {msg.timestamp && (
                  <span style={{ marginLeft: "auto", fontSize: "0.6rem" }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
              
              {/* Message content */}
              <div style={{ 
                userSelect: "text",
                cursor: "text"
              }}>
                {msg.text}
              </div>
              
              {/* Copy button for Eva's messages */}
              {msg.from === "eva" && (
                <button
                  onClick={() => copyToClipboard(msg.text)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "rgba(0,0,0,0.1)",
                    border: "none",
                    borderRadius: 4,
                    padding: "2px 6px",
                    fontSize: "0.7rem",
                    cursor: "pointer",
                    opacity: 0.7
                  }}
                  title="Copiar respuesta"
                >
                  📋
                </button>
              )}
            </div>
          </div>
        ))}
        
        {typing && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                background: "#fff",
                color: "#667eea",
                borderRadius: 14,
                padding: "10px 16px",
                fontSize: "1.05rem",
                boxShadow: "0 1px 6px #667eea11"
              }}
            >
              Eva está escribiendo...
            </div>
            <div className="dot-flashing" style={{
              width: 12, height: 12, borderRadius: "50%",
              background: "#667eea", animation: "dotFlashing 1s infinite linear alternate"
            }} />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      
      <form
        onSubmit={handleSend}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 18px",
          borderTop: "1px solid #f0f0f0",
          background: "#fff"
        }}
      >
        <input
          type="text"
          placeholder="Escribe tu mensaje... (o usa el micrófono)"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid #ddd",
            fontSize: "1rem",
            outline: "none",
            marginRight: 12
          }}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !newMessage.trim()}
          style={{
            background: "#667eea",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 18px",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s"
          }}
        >
          💬 Enviar
        </button>
      </form>

      <style>
        {`
          @keyframes dotFlashing {
            0% { opacity: 1; }
            50% { opacity: 0.3; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default ChatMain;