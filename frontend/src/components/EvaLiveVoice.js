import React, { useState, useRef } from "react";
import EvaAvatar from "./EvaAvatar";

const EvaLiveVoice = ({ onAddMessage, chatMessages = [] }) => {
  console.log("🎤 EvaLiveVoice component rendered - Continuous Mode");
  
  const [conversationActive, setConversationActive] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Presiona para iniciar conversación continua");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [userTranscription, setUserTranscription] = useState("");
  const [conversationHistory, setConversationHistory] = useState([
    { role: "system", content: "Eres Eva, una asistente útil y simpática." }
  ]);
  
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Contexto dinámico para memoria conversacional
  const getContextForEva = () => {
    if (conversationHistory.length <= 1) {
      return "Eres Eva, una asistente útil y simpática. Responde de forma natural y conversacional.";
    }
    
    const recentHistory = conversationHistory
      .slice(-6)
      .filter(msg => msg.role !== "system")
      .map(msg => `${msg.role === "user" ? "Usuario" : "Eva"}: ${msg.content}`)
      .join("\n");
      
    return `Eres Eva, una asistente útil y simpática. 

Contexto de la conversación reciente:
${recentHistory}

Continúa la conversación de forma natural, haciendo referencia al contexto cuando sea relevante.`;
  };

  // Iniciar conversación continua
  const startContinuousConversation = async () => {
    try {
      setStatus("Conectando...");
      
      // 1. Conectar WebSocket a OpenAI Realtime API
      const ws = new WebSocket(`ws://localhost:3002/stream`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("🔌 Conectado a OpenAI Realtime API");
        setStatus("Configurando sesión...");
        
        // 2. Configurar sesión con VAD automático
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['audio', 'text'],
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000,
              create_response: true
            },
            instructions: getContextForEva(),
            temperature: 0.8
          }
        }));
      };

      ws.onmessage = (event) => {
        // Handle both text and binary data
        if (event.data instanceof Blob) {
          // Binary data (audio) - convert to text first
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const serverEvent = JSON.parse(reader.result);
              handleServerEvent(serverEvent);
            } catch (err) {
              console.log('📦 Received binary data (probably audio), skipping JSON parse');
            }
          };
          reader.readAsText(event.data);
        } else {
          // Text data (JSON)
          try {
            const serverEvent = JSON.parse(event.data);
            handleServerEvent(serverEvent);
          } catch (err) {
            console.error('❌ Error parsing WebSocket message:', err);
            console.log('📦 Raw data:', event.data);
          }
        }
      };

      ws.onclose = () => {
        console.log("🔌 Conexión cerrada");
        setConversationActive(false);
        setStatus("Conversación finalizada");
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setError("Error de conexión");
        setConversationActive(false);
      };

      // 3. Iniciar captura de audio continua
      await startAudioCapture();
      
      setConversationActive(true);
      setStatus("¡Conversación iniciada! Empieza a hablar...");
      
    } catch (err) {
      console.error("❌ Error iniciando conversación:", err);
      setError("No se pudo iniciar la conversación: " + err.message);
    }
  };

  // Capturar audio continuo y enviarlo via WebSocket
  const startAudioCapture = async () => {
    try {
      // Obtener micrófono
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
      
      // Configurar AudioContext para streaming
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000
      });
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(1024, 1, 1);
      
      processor.onaudioprocess = (event) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const audioData = event.inputBuffer.getChannelData(0);
          
          // Convertir Float32 a PCM16
          const pcm16 = new Int16Array(audioData.length);
          for (let i = 0; i < audioData.length; i++) {
            pcm16[i] = Math.max(-32768, Math.min(32767, audioData[i] * 32768));
          }
          
          // Enviar audio como base64
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
          
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: base64Audio
          }));
        }
      };
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
    } catch (err) {
      throw new Error("No se pudo acceder al micrófono: " + err.message);
    }
  };

  // Manejar eventos del servidor
  const handleServerEvent = (event) => {
    console.log("📡 Evento recibido:", event.type);
    
    switch (event.type) {
      case 'session.updated':
        console.log("✅ Sesión configurada");
        break;
        
      case 'input_audio_buffer.speech_started':
        console.log("🎤 Usuario empezó a hablar");
        setIsListening(true);
        setIsSpeaking(false);
        setStatus("Te escucho...");
        // Interrumpir audio de Eva si está hablando
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
        }
        break;
        
      case 'input_audio_buffer.speech_stopped':
        console.log("🎤 Usuario dejó de hablar");
        setIsListening(false);
        setStatus("Procesando...");
        break;
        
      case 'conversation.item.input_audio_transcription.completed':
        console.log("👤 Usuario dijo:", event.transcript);
        setUserTranscription(event.transcript);
        break;
        
      case 'response.audio.delta':
        // Acumular chunks de audio de Eva
        audioChunksRef.current.push(event.delta);
        break;
        
      case 'response.audio_transcript.delta':
        // Acumular transcripción de Eva
        setTranscription(prev => prev + event.delta);
        break;
        
      case 'response.audio.done':
        console.log("🤖 Eva terminó de hablar");
        setIsSpeaking(false);
        setStatus("Tu turno - Habla cuando quieras");
        break;
        
      case 'response.audio_transcript.done':
        console.log("📝 Eva transcript completed:", event.transcript);
        // Set the complete transcription when it's done
        if (event.transcript) {
          setTranscription(event.transcript);
        }
        break;
        
      case 'response.content_part.done':
        console.log("📝 Content part done:", event);
        // Sometimes the transcript comes here
        if (event.part?.transcript) {
          setTranscription(event.part.transcript);
        }
        break;
        
      case 'response.output_item.done':
        console.log("📝 Output item done:", event);
        // Check for transcript in output item
        if (event.item?.content?.[0]?.transcript) {
          setTranscription(event.item.content[0].transcript);
        }
        break;
        
      case 'response.done':
        console.log("🤖 Eva response completed");
        console.log("📝 Current transcription state:", transcription);
        console.log("👤 Current user transcription:", userTranscription);
        
        // Try to get transcript from the response object if not already set
        if (!transcription && event.response?.output?.[0]?.content?.[0]?.transcript) {
          const finalTranscript = event.response.output[0].content[0].transcript;
          console.log("📝 Found transcript in response.done:", finalTranscript);
          setTranscription(finalTranscript);
          
          // Force update conversation history with the found transcript
          setTimeout(() => {
            updateConversationHistoryForced(userTranscription, finalTranscript);
          }, 100);
        } else {
          // Normal flow
          updateConversationHistory();
        }
        
        // Reproducir audio de Eva
        if (audioChunksRef.current.length > 0) {
          playEvaAudio();
        }
        
        // Limpiar para próxima respuesta
        audioChunksRef.current = [];
        break;
        
      case 'error':
        console.error("❌ Error del servidor:", event);
        setError(event.error?.message || "Error del servidor");
        break;
        
      default:
        console.log("📡 Evento no manejado:", event.type);
        break;
    }
  };

  // Reproducir audio de Eva
  const playEvaAudio = () => {
    try {
      setIsSpeaking(true);
      setStatus("Eva está hablando...");
      
      // Convertir chunks PCM16 a WAV
      const pcmData = audioChunksRef.current.join('');
      const binaryString = atob(pcmData);
      const pcmBuffer = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        pcmBuffer[i] = binaryString.charCodeAt(i);
      }
      
      // Crear WAV blob
      const wavBuffer = pcmToWav(pcmBuffer, 24000, 1);
      const audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Reproducir
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = audioUrl;
        audioPlayerRef.current.play().catch(console.error);
      }
      
    } catch (err) {
      console.error("❌ Error reproduciendo audio:", err);
      setIsSpeaking(false);
      setStatus("Error reproduciendo audio");
    }
  };

  // Convertir PCM a WAV
  const pcmToWav = (pcmBuffer, sampleRate, channels) => {
    const length = pcmBuffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    
    // WAV header
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
    
    // Copy PCM data
    const pcmView = new Uint8Array(arrayBuffer, 44);
    pcmView.set(new Uint8Array(pcmBuffer));
    
    return arrayBuffer;
  };

  // Function to add voice messages to text chat
  const addToTextChat = (userText, evaText) => {
    console.log('🎤 Adding to chat:', { userText, evaText });
    
    if (onAddMessage && userText && evaText) {
      const timestamp = Date.now(); // Use same base timestamp
      
      // Add user message first
      const userMessage = {
        from: "user",
        text: userText,
        type: "voice",
        timestamp: new Date(timestamp).toISOString()
      };
      
      // Add Eva's response
      const evaMessage = {
        from: "eva", 
        text: evaText,
        type: "voice",
        timestamp: new Date(timestamp + 1).toISOString() // Slightly different timestamp
      };
      
      console.log('🎤 Sending user message:', userMessage);
      console.log('🎤 Sending eva message:', evaMessage);
      
      // Send both messages
      onAddMessage(userMessage);
      onAddMessage(evaMessage);
      
    } else {
      console.log('⚠️ Cannot add to chat - missing onAddMessage or text');
    }
  };

  // Actualizar historial de conversación
  const updateConversationHistory = () => {
    if (userTranscription && transcription) {
      const newHistory = [
        ...conversationHistory,
        { role: "user", content: userTranscription.trim() },
        { role: "assistant", content: transcription.trim() }
      ];
      
      setConversationHistory(newHistory);

      // FIX: Send to text chat interface
      addToTextChat(userTranscription.trim(), transcription.trim());
      
      // Save to database
      fetch('http://localhost:3001/api/context/gaston', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: newHistory.map(msg => ({
            ...msg,
            timestamp: new Date()
          }))
        })
      }).catch(err => console.log('⚠️ Error guardando contexto:', err));
      
      // IMPORTANT: Clear transcriptions after sending to chat
      setUserTranscription("");
      setTranscription("");
    }
  };

  // Force update conversation history (bypassing checks)
  const updateConversationHistoryForced = (userText, evaText) => {
    console.log("🔄 Forced update with:", { userText, evaText });
    
    if (userText && evaText) {
      const newHistory = [
        ...conversationHistory,
        { role: "user", content: userText.trim() },
        { role: "assistant", content: evaText.trim() }
      ];
      
      setConversationHistory(newHistory);

      // Send to text chat interface
      addToTextChat(userText.trim(), evaText.trim());
      
      // Save to database
      fetch('http://localhost:3001/api/context/gaston', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: newHistory.map(msg => ({
            ...msg,
            timestamp: new Date()
          }))
        })
      }).catch(err => console.log('⚠️ Error guardando contexto:', err));
      
      // Clear transcriptions
      setUserTranscription("");
      setTranscription("");
    }
  };

  // Detener conversación
  const stopConversation = () => {
    // Cerrar WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Detener audio
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
    setStatus("Presiona para iniciar conversación continua");
    audioChunksRef.current = [];
  };

  // Toggle conversación
  const handleConversationToggle = () => {
    if (conversationActive) {
      stopConversation();
    } else {
      startContinuousConversation();
    }
  };

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "48px auto",
        padding: 32,
        borderRadius: 20,
        background: "#fafbfc",
        boxShadow: "0 4px 32px 0 #0001",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        minHeight: 500,
        justifyContent: "center"
      }}
    >
      <EvaAvatar speaking={isSpeaking || isListening} />
      
      <h2
        style={{
          margin: 0,
          fontWeight: 700,
          fontSize: "1.6rem",
          background: "linear-gradient(135deg, #667eea 0%, #ff1744 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: "center"
        }}
      >
        Conversación Continua con Eva
      </h2>
      
      <p style={{ 
        margin: 0, 
        color: "#666", 
        textAlign: "center", 
        fontSize: "0.95rem",
        maxWidth: 320,
        lineHeight: 1.4
      }}>
        Como el Voice Mode de OpenAI. Presiona una vez para iniciar, habla naturalmente.
      </p>
      
      <button
        onClick={handleConversationToggle}
        disabled={false}
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          border: "none",
          background: conversationActive
            ? "linear-gradient(135deg, #ff1744, #ff4569)" 
            : "linear-gradient(135deg, #667eea, #764ba2)",
          color: "#fff",
          fontSize: "2rem",
          cursor: "pointer",
          boxShadow: conversationActive
            ? "0 0 0 8px rgba(255, 23, 68, 0.2), 0 8px 32px rgba(255, 23, 68, 0.3)" 
            : "0 8px 32px rgba(102, 126, 234, 0.3)",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "20px 0"
        }}
      >
        {conversationActive ? "⏹️" : "🎤"}
      </button>
      
      <div
        style={{
          fontWeight: 600,
          color: isListening ? "#4caf50" : (isSpeaking ? "#ff1744" : (conversationActive ? "#667eea" : "#444")),
          marginBottom: 8,
          minHeight: 28,
          textAlign: "center",
          fontSize: "1.1rem"
        }}
      >
        {status}
      </div>
      
      {/* Estados visuales */}
      {isListening && (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 8,
          padding: "12px 20px",
          background: "rgba(76, 175, 80, 0.1)",
          borderRadius: 12,
          border: "2px solid rgba(76, 175, 80, 0.2)"
        }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#4caf50",
            animation: "pulse 1.5s infinite"
          }} />
          <span style={{ color: "#4caf50", fontWeight: 600 }}>
            Escuchando...
          </span>
        </div>
      )}
      
      {isSpeaking && (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 8,
          padding: "12px 20px",
          background: "rgba(255, 23, 68, 0.1)",
          borderRadius: 12,
          border: "2px solid rgba(255, 23, 68, 0.2)"
        }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#ff1744",
            animation: "pulse 1.5s infinite"
          }} />
          <span style={{ color: "#ff1744", fontWeight: 600 }}>
            Eva hablando...
          </span>
        </div>
      )}
      
      {/* Player de audio oculto */}
      <audio
        ref={audioPlayerRef}
        style={{ display: "none" }}
        onEnded={() => {
          setIsSpeaking(false);
          setStatus("Tu turno - Habla cuando quieras");
        }}
      />
      
      {/* Transcripciones */}
      <div style={{ width: "100%", maxWidth: 400, marginTop: 20 }}>
        {userTranscription && (
          <div
            style={{
              marginBottom: 12,
              fontSize: "1rem",
              color: "#4caf50",
              background: "rgba(76, 175, 80, 0.1)",
              borderRadius: 12,
              padding: "12px 16px",
              borderLeft: "4px solid #4caf50"
            }}
          >
            <strong>Tú:</strong> {userTranscription}
          </div>
        )}
        
        {transcription && (
          <div
            style={{
              fontSize: "1rem",
              color: "#333",
              background: "rgba(255, 23, 68, 0.05)",
              borderRadius: 12,
              padding: "12px 16px",
              borderLeft: "4px solid #ff1744"
            }}
          >
            <strong>Eva:</strong> {transcription}
          </div>
        )}
      </div>
      
      {error && (
        <div
          style={{
            color: "#ff1744",
            background: "rgba(255, 23, 68, 0.1)",
            borderRadius: 12,
            padding: "12px 16px",
            marginTop: 16,
            fontWeight: 500,
            textAlign: "center",
            border: "1px solid rgba(255, 23, 68, 0.2)"
          }}
        >
          {error}
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
        `}
      </style>
    </div>
  );
};

export default EvaLiveVoice;