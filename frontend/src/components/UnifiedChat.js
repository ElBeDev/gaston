import React, { useState, useRef, useEffect } from "react";
import EvaAvatar from "./EvaAvatar";

const UnifiedChat = () => {
  console.log("💬 UnifiedChat component rendered");

  // Chat states
  const [messages, setMessages] = useState([
    { from: "eva", text: "¡Hola! Soy Eva. Puedes escribir o hablar conmigo.", type: "text", timestamp: new Date().toISOString() }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Voice states
  const [conversationActive, setConversationActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Presiona el micrófono para hablar");
  // ...existing code...

  // Pending conversation state
  const [pendingConversation, setPendingConversation] = useState({
    userText: "",
    evaText: "",
    userReceived: false,
    evaReceived: false
  });

  // Voice refs
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Refs to store current values (for voice handling)
  const currentUserSpeechRef = useRef("");
  const currentEvaSpeechRef = useRef("");

  // Auto scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/chat/history/gaston');
        const history = await response.json();
        
        if (history && history.length > 0) {
          const formattedMessages = history.map(msg => ({
            from: msg.role === 'user' ? 'user' : 'eva',
            text: msg.message || msg.content,
            type: 'text',
            timestamp: msg.timestamp || new Date().toISOString()
          }));
          
          setMessages(prev => [...formattedMessages, ...prev.slice(1)]); // Keep welcome message
        }
      } catch (error) {
        console.error('❌ Error loading chat history:', error);
      }
    };

    loadHistory();
  }, []);

  // Add message to chat
  const addMessage = (from, text, type = "text") => {
    const message = {
      from,
      text,
      type,
      timestamp: new Date().toISOString()
    };
    
    console.log(`📝 Adding ${type} message:`, message);
    setMessages(prev => [...prev, message]);
    return message;
  };

  // Send text message
  const handleSendText = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const userMsg = addMessage("user", newMessage.trim(), "text");
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
      
      addMessage("eva", data.response || "No entendí, ¿puedes repetir?", "text");

    } catch (err) {
      addMessage("eva", "Ocurrió un error al contactar a Eva.", "error");
    }
    
    setLoading(false);
    setTyping(false);
  };

  // Voice conversation functions
  const startVoiceConversation = async () => {
    try {
      setVoiceStatus("Conectando...");
      
      const ws = new WebSocket(`ws://localhost:3003/stream`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("🔌 Conectado a OpenAI Realtime API");
        setVoiceStatus("Configurando...");
        
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['audio', 'text'],
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: { model: 'whisper-1' },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000,
              create_response: true
            },
            instructions: "Eres Eva, una asistente útil y simpática. Responde de forma natural y conversacional.",
            temperature: 0.8
          }
        }));
      };

      // Handle both text and binary data
      ws.onmessage = (event) => {
        // Check if it's a Blob (binary data)
        if (event.data instanceof Blob) {
          // Convert Blob to text first
          event.data.text().then(text => {
            try {
              const serverEvent = JSON.parse(text);
              console.log('📥 Frontend received JSON from Blob:', serverEvent.type);
              handleVoiceEvent(serverEvent);
            } catch (err) {
              console.log('📦 Frontend received binary blob, not JSON:', text.substring(0, 100));
            }
          });
        } else if (typeof event.data === 'string') {
          // Handle string data (JSON)
          try {
            const serverEvent = JSON.parse(event.data);
            console.log('📥 Frontend received JSON string:', serverEvent.type);
            handleVoiceEvent(serverEvent);
          } catch (err) {
            console.log('📦 Frontend received string but not JSON:', event.data.substring(0, 100));
          }
        } else {
          // Handle ArrayBuffer or other binary types
          console.log('📦 Frontend received binary data:', event.data?.byteLength || 'undefined', 'bytes');
          
          // Try to convert ArrayBuffer to string
          if (event.data instanceof ArrayBuffer) {
            try {
              const text = new TextDecoder().decode(event.data);
              const serverEvent = JSON.parse(text);
              console.log('📥 Frontend received JSON from ArrayBuffer:', serverEvent.type);
              handleVoiceEvent(serverEvent);
            } catch (err) {
              console.log('📦 ArrayBuffer is not JSON');
            }
          }
        }
      };

      ws.onclose = () => {
        console.log("🔌 Conexión cerrada");
        setConversationActive(false);
        setVoiceStatus("Presiona el micrófono para hablar");
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setConversationActive(false);
        setVoiceStatus("Error de conexión");
      };

      await startAudioCapture();
      setConversationActive(true);
      setVoiceStatus("🎤 Habla ahora...");
      
    } catch (err) {
      console.error("❌ Error iniciando conversación:", err);
      setVoiceStatus("Error: " + err.message);
    }
  };

  const startAudioCapture = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 24000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    
    mediaStreamRef.current = stream;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 24000
    });
    audioContextRef.current = audioContext;
    
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (event) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const audioData = event.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(audioData.length);
        
        for (let i = 0; i < audioData.length; i++) {
          pcm16[i] = Math.max(-32768, Math.min(32767, audioData[i] * 32768));
        }
        
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
        
        wsRef.current.send(JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: base64Audio
        }));
      }
    };
    
    source.connect(processor);
    processor.connect(audioContext.destination);
  };

  const handleVoiceEvent = (event) => {
    console.log("📡 Voice event:", event.type, event);
    
    switch (event.type) {
      case 'session.updated':
        console.log("✅ Sesión configurada");
        break;
        
      case 'input_audio_buffer.speech_started':
        console.log("🎤 Usuario empezó a hablar");
        setIsListening(true);
        setIsSpeaking(false);
        setVoiceStatus("Te escucho...");
        // Reset for new conversation
        currentUserSpeechRef.current = "";
        currentEvaSpeechRef.current = "";
        setPendingConversation({
          userText: "",
          evaText: "",
          userReceived: false,
          evaReceived: false
        });
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
        }
        break;
        
      case 'input_audio_buffer.speech_stopped':
        console.log("🎤 Usuario dejó de hablar");
        setIsListening(false);
        setVoiceStatus("Procesando...");
        break;
        
      case 'conversation.item.input_audio_transcription.completed':
        console.log("👤 Usuario transcripción RECEIVED:", event.transcript);
        const userText = event.transcript || "";
        currentUserSpeechRef.current = userText;
        console.log("👤 Stored user speech:", userText);
        
        // Store user text and mark as received
        setPendingConversation(prev => ({
          ...prev,
          userText: userText,
          userReceived: true
        }));
        console.log("📝 User transcript stored in pending conversation");
        break;
        
      case 'response.audio.delta':
        if (event.delta) {
          audioChunksRef.current.push(event.delta);
        }
        break;
        
      case 'response.audio_transcript.delta':
        console.log("📝 Eva transcript delta RECEIVED:", event.delta);
        if (event.delta) {
          const newEvaText = currentEvaSpeechRef.current + event.delta;
          currentEvaSpeechRef.current = newEvaText;
          console.log("📝 Accumulated Eva speech:", newEvaText);
        }
        break;
        
      case 'response.audio_transcript.done':
        console.log("📝 Eva transcript done RECEIVED:", event.transcript);
        if (event.transcript) {
          currentEvaSpeechRef.current = event.transcript;
          console.log("📝 Final Eva transcript set:", event.transcript);
          
          // Store Eva text and mark as received
          setPendingConversation(prev => ({
            ...prev,
            evaText: event.transcript,
            evaReceived: true
          }));
          console.log("📝 Eva transcript stored in pending conversation");
        }
        break;

      case 'response.done':
        console.log("🤖 Response completed RECEIVED");
        
        // Play audio first
        if (audioChunksRef.current.length > 0) {
          playEvaAudio();
        }
        
        // Check if we have Eva text from transcript.done, if not use accumulated
        const finalEvaText = currentEvaSpeechRef.current;
        if (finalEvaText && !pendingConversation.evaReceived) {
          setPendingConversation(prev => ({
            ...prev,
            evaText: finalEvaText,
            evaReceived: true
          }));
        }
        
        // Try to add conversation to chat (will be handled by useEffect)
        console.log("🔄 Checking if conversation can be added to chat...");
        
        // Reset for next turn
        currentUserSpeechRef.current = "";
        currentEvaSpeechRef.current = "";
        audioChunksRef.current = [];
        setVoiceStatus("🎤 Tu turno...");
        break;
        
      case 'error':
        console.error("❌ Voice error:", event);
        setVoiceStatus("Error: " + (event.error?.message || "Desconocido"));
        break;
        
      default:
        console.log("📡 Unhandled event:", event.type, event);
        break;
    }
  };

  const playEvaAudio = () => {
    try {
      setIsSpeaking(true);
      setVoiceStatus("🔊 Eva está hablando...");
      
      const pcmData = audioChunksRef.current.join('');
      const binaryString = atob(pcmData);
      const pcmBuffer = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        pcmBuffer[i] = binaryString.charCodeAt(i);
      }
      
      const wavBuffer = pcmToWav(pcmBuffer, 24000, 1);
      const audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = audioUrl;
        audioPlayerRef.current.play().catch(console.error);
      }
      
    } catch (err) {
      console.error("❌ Error playing audio:", err);
      setIsSpeaking(false);
      setVoiceStatus("Error reproduciendo audio");
    }
  };

  const pcmToWav = (pcmBuffer, sampleRate, channels) => {
    const length = pcmBuffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * 2, true);
    view.setUint16(32, channels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);
    
    const pcmView = new Uint8Array(arrayBuffer, 44);
    pcmView.set(new Uint8Array(pcmBuffer));
    
    return arrayBuffer;
  };

  const stopVoiceConversation = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    
    setConversationActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setVoiceStatus("Presiona el micrófono para hablar");
    currentUserSpeechRef.current = "";
    currentEvaSpeechRef.current = "";
    audioChunksRef.current = [];
  };

  const handleVoiceToggle = () => {
    if (conversationActive) {
      stopVoiceConversation();
    } else {
      startVoiceConversation();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('✅ Copied to clipboard:', text);
    });
  };

  const getMessageIcon = (msg) => {
    if (msg.type === "voice") {
      return msg.from === "user" ? "🎤" : "🔊";
    }
    return msg.from === "user" ? "💬" : "🤖";
  };

  // Handle conversation completion
  useEffect(() => {
    // Check if we have both user and eva transcripts
    if (pendingConversation.userReceived && pendingConversation.evaReceived && 
        pendingConversation.userText && pendingConversation.evaText) {
      
      console.log("💬 Adding complete conversation to chat:");
      console.log("👤 User:", pendingConversation.userText);
      console.log("🤖 Eva:", pendingConversation.evaText);
      
      // Add user message first
      addMessage("user", pendingConversation.userText, "voice");
      
      // Add Eva message after a short delay to ensure proper order
      setTimeout(() => {
        addMessage("eva", pendingConversation.evaText, "voice");
      }, 50);
      
      // Clear pending conversation
      setPendingConversation({
        userText: "",
        evaText: "",
        userReceived: false,
        evaReceived: false
      });
    }
  }, [pendingConversation]);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxHeight: 800,
        maxWidth: 800,
        margin: "0 auto",
        overflow: "hidden"
      }}
    >
      {/* Header with Eva Avatar */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid #e5e7eb",
          background: "#2563eb",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 16
        }}
      >
        <div style={{ transform: "scale(0.8)" }}>
          <EvaAvatar speaking={isSpeaking || isListening} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>
            💬 Chat con Eva
          </h2>
          <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
            Escribe o habla - Todo en un solo lugar
          </p>
        </div>
      </div>
      
      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          background: "#f9fafb"
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
              marginBottom: 16
            }}
          >
            <div
              style={{
                background: msg.from === "user" ? "#2563eb" : "#fff",
                color: msg.from === "user" ? "#fff" : "#374151",
                borderRadius: 8,
                padding: "14px 18px",
                maxWidth: 480,
                boxShadow: msg.from === "eva" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                fontSize: "1rem",
                lineHeight: 1.5,
                position: "relative",
                border: msg.type === "voice" ? `1px solid ${msg.from === "user" ? "#059669" : "#dc2626"}` : "none"
              }}
            >
              {/* Message type indicator */}
              <div 
                style={{
                  fontSize: "0.75rem",
                  opacity: 0.8,
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                {getMessageIcon(msg)}
                <span style={{ fontWeight: 600 }}>
                  {msg.type === "voice" ? "Voz" : "Texto"}
                </span>
                <span style={{ marginLeft: "auto", fontSize: "0.7rem" }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              {/* Message content */}
              <div style={{ userSelect: "text", cursor: "text" }}>
                {msg.text}
              </div>
              
              {/* Copy button for Eva's messages */}
              {msg.from === "eva" && (
                <button
                  onClick={() => copyToClipboard(msg.text)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "rgba(0,0,0,0.1)",
                    border: "none",
                    borderRadius: 6,
                    padding: "4px 8px",
                    fontSize: "0.7rem",
                    cursor: "pointer",
                    opacity: 0.7,
                    transition: "opacity 0.2s"
                  }}
                  title="Copiar respuesta"
                  aria-label="Copiar respuesta"
                  onMouseEnter={(e) => e.target.style.opacity = 1}
                  onMouseLeave={(e) => e.target.style.opacity = 0.7}
                >
                  📋
                </button>
              )}
            </div>
          </div>
        ))}
        
        {typing && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div
              style={{
                background: "#fff",
                color: "#2563eb",
                borderRadius: 8,
                padding: "12px 18px",
                fontSize: "1rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <div className="dot-flashing" />
              Eva está escribiendo...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      
      {/* Voice Status (when active) */}
      {conversationActive && (
        <div
          style={{
            padding: "12px 24px",
            background: isListening ? "rgba(5, 150, 105, 0.1)" : (isSpeaking ? "rgba(220, 38, 38, 0.1)" : "rgba(37, 99, 235, 0.1)"),
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: "0.95rem",
            fontWeight: 600,
            color: isListening ? "#059669" : (isSpeaking ? "#dc2626" : "#2563eb")
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: isListening ? "#059669" : (isSpeaking ? "#dc2626" : "#2563eb"),
              animation: "pulse 1.5s infinite"
            }}
          />
          {voiceStatus}
        </div>
      )}
      
      {/* Input Area */}
      <div
        style={{
          padding: "20px 24px",
          borderTop: "1px solid #e5e7eb",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 12
        }}
      >
        <form
          onSubmit={handleSendText}
          style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}
        >
          <input
            type="text"
            placeholder="Escribe tu mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{
              flex: 1,
              padding: "14px 18px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: "1rem",
              outline: "none",
              background: "#f9fafb"
            }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 20px",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: (loading || !newMessage.trim()) ? 0.6 : 1
            }}
          >
            💬 Enviar
          </button>
        </form>
        
        {/* Voice Button */}
        <button
          onClick={handleVoiceToggle}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            background: conversationActive ? "#dc2626" : "#059669",
            color: "#fff",
            fontSize: "1.5rem",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title={conversationActive ? "Parar conversación de voz" : "Iniciar conversación de voz"}
          aria-label={conversationActive ? "Parar conversación de voz" : "Iniciar conversación de voz"}
        >
          {conversationActive ? "⏹️" : "🎤"}
        </button>
      </div>

      {/* Audio player */}
      <audio
        ref={audioPlayerRef}
        style={{ display: "none" }}
        onEnded={() => {
          setIsSpeaking(false);
          setVoiceStatus("🎤 Tu turno...");
        }}
      />

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
          }
          
          @keyframes dotFlashing {
            0% { opacity: 1; }
            50% { opacity: 0.3; }
            100% { opacity: 1; }
          }
          
          .dot-flashing {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #2563eb;
            animation: dotFlashing 1.5s infinite linear alternate;
          }
        `}
      </style>
    </div>
  );
};

export default UnifiedChat;