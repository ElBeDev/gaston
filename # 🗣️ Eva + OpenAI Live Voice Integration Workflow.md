# 🗣️ Eva + OpenAI Live Voice Integration Workflow

## 🎯 Objetivo

Integrar conversación en tiempo real por voz usando la OpenAI Realtime API (gpt-4o-realtime-preview) en Eva, con **chat unificado** que combina texto y voz en una sola interfaz.

---

## 1️⃣ **Requerimientos Previos**

- Cuenta OpenAI con acceso a gpt-4o-realtime-preview (beta)
- API Key de OpenAI válida y habilitada para Realtime
- Infraestructura Eva corriendo (React frontend + Node.js backend)
- Certificado SSL (WebRTC requiere HTTPS para producción)
- Permisos de micrófono en el navegador

---

## 2️⃣ **Arquitectura General (Actualizada)**

```
[Usuario] 🎤 💬
   ⇅ (WebSocket + HTTP)
[UnifiedChat React] ——— [Backend Node.js/Express] ——— [OpenAI Realtime API]
```

- **Frontend**: **UnifiedChat** - Una sola interfaz para texto y voz, captura audio, maneja conversaciones
- **Backend**: Proxy WebSocket para voz + API REST para texto
- **OpenAI API**: Procesa audio/texto en tiempo real y responde

---

## 3️⃣ **Estructura de archivos actual**

```
/frontend/src/components/UnifiedChat.js        # 🆕 COMPONENTE PRINCIPAL - Chat unificado texto + voz
/frontend/src/components/EvaAvatar.js          # Avatar animado de Eva 
/frontend/src/pages/ChatPage.js                # Página simplificada - solo renderiza UnifiedChat
/backend/src/routes/liveVoice.js               # WebSocket proxy para streaming continuo
/backend/src/routes/chat.js                    # Endpoints para mensajes de texto
/backend/src/routes/context.js                 # Sistema de contexto para persistir conversaciones
/backend/src/models/UserContext.js             # Modelo de datos para contexto de usuario
```

### 📁 **Archivos deprecados/eliminados:**
- ~~`/frontend/src/components/EvaLiveVoice.js`~~ → **Integrado en UnifiedChat**
- ~~`/frontend/src/components/ChatMain.js`~~ → **Integrado en UnifiedChat**
- ~~Arquitectura separada de texto vs voz~~ → **Todo unificado**

---

## 4️⃣ **Implementación Actual**

### A. **Frontend - UnifiedChat (Todo en uno)**
#### Archivo: `/frontend/src/components/UnifiedChat.js`

**🎯 Características implementadas:**
- ✅ **Chat unificado** - Texto y voz en la misma ventana
- ✅ **Conversación continua por voz** - Como OpenAI Voice Mode
- ✅ **VAD automático** - Detección automática de voz
- ✅ **Interrupciones** - Parar a Eva mientras habla
- ✅ **Botón de voz integrado** - Al lado del input de texto
- ✅ **Mensajes con iconos** - 💬 texto, 🎤 voz usuario, 🔊 voz Eva
- ✅ **Orden cronológico correcto** - Conversaciones aparecen en orden
- ✅ **Estados visuales** - Listening, Speaking, Processing
- ✅ **Botón copiar** - En todas las respuestas de Eva
- ✅ **Historial persistente** - Carga automática del historial
- ✅ **Bordes de colores** - Mensajes de voz tienen borde distintivo

```javascript
// Estructura principal del UnifiedChat
const UnifiedChat = () => {
  // Estados unificados
  const [messages, setMessages] = useState([...]);
  const [conversationActive, setConversationActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Refs para WebSocket y audio
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const currentUserSpeechRef = useRef("");
  const currentEvaSpeechRef = useRef("");
  
  // Estado para manejar conversaciones pendientes (orden correcto)
  const [pendingConversation, setPendingConversation] = useState({
    userText: "", evaText: "", userReceived: false, evaReceived: false
  });

  // Función unificada para añadir mensajes
  const addMessage = (from, text, type = "text") => {
    const message = { from, text, type, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, message]);
  };

  // Manejo de texto - envío a API REST
  const handleSendText = async (e) => {
    // ... envío HTTP a /api/chat/message
  };

  // Manejo de voz - WebSocket streaming
  const startVoiceConversation = async () => {
    const ws = new WebSocket(`ws://localhost:3002/stream`);
    // ... configuración WebSocket con VAD automático
  };

  // Procesamiento de eventos de voz con orden correcto
  const handleVoiceEvent = (event) => {
    switch (event.type) {
      case 'conversation.item.input_audio_transcription.completed':
        // Guardar transcripción de usuario y añadir mensaje inmediatamente
        setPendingConversation(prev => ({...prev, userText: event.transcript, userReceived: true}));
        break;
        
      case 'response.audio_transcript.done':
        // Guardar transcripción de Eva
        setPendingConversation(prev => ({...prev, evaText: event.transcript, evaReceived: true}));
        break;
        
      case 'response.done':
        // Finalizar respuesta - mensajes se añaden por useEffect cuando están completos
        break;
    }
  };

  // useEffect para añadir conversaciones completas en orden correcto
  useEffect(() => {
    if (pendingConversation.userReceived && pendingConversation.evaReceived && 
        pendingConversation.userText && pendingConversation.evaText) {
      
      // Añadir usuario primero
      addMessage("user", pendingConversation.userText, "voice");
      
      // Añadir Eva después con delay mínimo para asegurar orden
      setTimeout(() => {
        addMessage("eva", pendingConversation.evaText, "voice");
      }, 50);
      
      // Limpiar conversación pendiente
      setPendingConversation({userText: "", evaText: "", userReceived: false, evaReceived: false});
    }
  }, [pendingConversation]);

  return (
    // JSX unificado con input de texto + botón de voz integrado
    <div style={{...}}>
      {/* Header con avatar */}
      <div>
        <EvaAvatar speaking={isSpeaking || isListening} />
        <h2>💬 Chat con Eva</h2>
        <p>Escribe o habla - Todo en un solo lugar</p>
      </div>
      
      {/* Área de mensajes unificada */}
      <div>
        {messages.map((msg, i) => (
          <div key={i} style={{
            border: msg.type === "voice" ? "2px solid" : "none",
            borderColor: msg.from === "user" ? "#4caf50" : "#ff1744"
          }}>
            {/* Icono según tipo de mensaje */}
            {msg.type === "voice" ? (msg.from === "user" ? "🎤" : "🔊") : (msg.from === "user" ? "💬" : "🤖")}
            <span>{msg.type === "voice" ? "Voz" : "Texto"}</span>
            <div>{msg.text}</div>
            {/* Botón copiar para respuestas de Eva */}
            {msg.from === "eva" && <button onClick={() => copyToClipboard(msg.text)}>📋</button>}
          </div>
        ))}
      </div>
      
      {/* Input unificado - texto + voz */}
      <div>
        <form onSubmit={handleSendText}>
          <input placeholder="Escribe tu mensaje..." />
          <button type="submit">💬 Enviar</button>
        </form>
        
        {/* Botón de voz integrado */}
        <button onClick={handleVoiceToggle} style={{
          background: conversationActive ? "linear-gradient(135deg, #ff1744, #ff4569)" : "linear-gradient(135deg, #4caf50, #66bb6a)"
        }}>
          {conversationActive ? "⏹️" : "🎤"}
        </button>
      </div>
    </div>
  );
};
```

#### Archivo: `/frontend/src/pages/ChatPage.js` (Simplificado)

```javascript
import React from 'react';
import { Box } from '@mui/material';
import UnifiedChat from "../components/UnifiedChat";

const ChatPage = () => {
  return (
    <Box sx={{ /* styling */ }}>
      <UnifiedChat />
    </Box>
  );
};
```

---

### B. **Backend (Sin cambios mayores)**
#### Archivo: `/backend/src/routes/liveVoice.js`

**WebSocket proxy para streaming continuo:**

```javascript
// WebSocket server en puerto 3002 para streaming
const initializeWebSocketServer = () => {
  wss = new WebSocket.Server({ port: 3002, path: '/stream' });
  
  wss.on('connection', (clientWs) => {
    let openaiWs = null;
    
    clientWs.on('message', async (message) => {
      const event = JSON.parse(message);
      
      if (event.type === 'session.update') {
        // Conectar a OpenAI con VAD habilitado
        openaiWs = new WebSocket("wss://api.openai.com/v1/realtime", {
          headers: {
            "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
            "OpenAI-Beta": "realtime=v1"
          }
        });
        
        openaiWs.on('message', (data) => {
          // CRITICAL: Forward inmediatamente sin procesamiento
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(data);
          }
        });
      } else if (openaiWs?.readyState === WebSocket.OPEN) {
        // Proxy de eventos de audio
        openaiWs.send(JSON.stringify(event));
      }
    });
  });
};
```

#### Archivo: `/backend/src/routes/chat.js` (Sin cambios)

- Endpoints para chat de texto tradicional
- `POST /api/chat/message` - Enviar mensaje de texto
- `GET /api/chat/history/:userId` - Obtener historial

---

## 5️⃣ **Flujo de usuario actual**

### **💬 Modo Texto:**
1. Usuario escribe mensaje → Enter o botón "💬 Enviar"
2. Mensaje aparece en chat con icono 💬
3. Eva responde vía API REST → Aparece con icono 🤖
4. Botón 📋 para copiar respuesta

### **🎤 Modo Voz:**
1. Usuario presiona botón 🎤 → Inicia conversación continua
2. Usuario habla naturalmente → VAD detecta automáticamente
3. Transcripción aparece en chat con icono 🎤 y borde verde
4. Eva responde automáticamente → Aparece con icono 🔊 y borde rojo
5. Usuario puede interrumpir a Eva hablando
6. Ciclo continúa hasta presionar ⏹️

### **🔄 Modo Híbrido:**
- Cambiar entre texto y voz dinámicamente
- Todo aparece en la misma ventana cronológicamente
- Historial persistente de ambos tipos

---

## 6️⃣ **Problemas resueltos en la nueva arquitectura**

### ✅ **Problema: Mensajes de voz aparecían desordenados**
**Solución:** 
- Sistema de `pendingConversation` que espera ambas transcripciones
- `useEffect` que añade mensajes en orden correcto con delay de 50ms
- Usuario siempre aparece antes que Eva

### ✅ **Problema: Interfaz fragmentada (texto vs voz)**
**Solución:**
- `UnifiedChat` - Una sola interfaz para todo
- Botón de voz integrado al lado del input de texto
- Mensajes mezclados cronológicamente con iconos distintivos

### ✅ **Problema: Transcripciones vacías en `response.done`**
**Solución:**
- Usar `currentUserSpeechRef` y `currentEvaSpeechRef` para evitar state stale
- Añadir mensajes cuando llegan las transcripciones, no en `response.done`
- Manejo de eventos `conversation.item.input_audio_transcription.completed`

### ✅ **Problema: Frontend recibía datos binarios mezclados**
**Solución:**
```javascript
ws.onmessage = (event) => {
  if (event.data instanceof Blob) {
    event.data.text().then(text => {
      const serverEvent = JSON.parse(text);
      handleVoiceEvent(serverEvent);
    });
  }
  // ... manejar otros tipos de datos
};
```

### ✅ **Problema: Estados de conversación confusos**
**Solución:**
- Estados visuales claros: "Te escucho...", "Eva hablando...", "Tu turno..."
- Indicador de estado con color y emoji
- Avatar animado que responde al estado actual

---

## 7️⃣ **Características finales implementadas**

### **🎯 UnifiedChat:**
✅ **Chat unificado completo** - Texto y voz en una interfaz  
✅ **Orden cronológico perfecto** - Conversaciones en secuencia correcta  
✅ **Iconos distintivos** - 💬🤖 texto, 🎤🔊 voz  
✅ **Bordes de colores** - Verde usuario, rojo Eva para voz  
✅ **Botón copiar universal** - En todas las respuestas de Eva  
✅ **Historial persistente** - Carga automática de conversaciones previas  
✅ **Estados visuales avanzados** - Feedback en tiempo real  
✅ **Responsive design** - Se adapta a diferentes tamaños  

### **🎤 Conversación de voz:**
✅ **VAD automático** - Detección server-side sin botones manuales  
✅ **Interrupciones en tiempo real** - Parar a Eva mientras habla  
✅ **Streaming bidireccional** - Latencia mínima  
✅ **Transcripción automática** - Usuario y Eva transcritos  
✅ **Un solo botón** - Start/Stop conversación completa  
✅ **Manejo robusto de WebSocket** - Reconexión y error handling  

### **💬 Chat de texto:**
✅ **API REST tradicional** - Envío HTTP estándar  
✅ **Historial completo** - Persistencia en base de datos  
✅ **Typing indicators** - Feedback mientras Eva responde  
✅ **Error handling** - Manejo graceful de errores de API  

---

## 8️⃣ **Configuración técnica actual**

### **Endpoints:**
- `WS ws://localhost:3002/stream` - Streaming de voz continuo
- `POST /api/chat/message` - Envío de mensajes de texto
- `GET /api/chat/history/:userId` - Historial de conversaciones
- `GET/PUT /api/context/:userId` - Manejo de contexto

### **Puertos:**
- **3000** - Frontend React
- **3001** - API HTTP Express
- **3002** - WebSocket server para voz

### **Variables de entorno:**
```bash
OPENAI_API_KEY=sk-...  # Con acceso a Realtime API
```

---

## 9️⃣ **Roadmap actualizado**

### **✅ Completado:**
- [x] Prototipo básico de Live Voice
- [x] Integración con backend y OpenAI
- [x] Transcripción bidireccional
- [x] Sistema de memoria conversacional
- [x] **UnifiedChat - Interfaz única para texto + voz**
- [x] **Orden cronológico correcto en conversaciones**
- [x] **VAD automático y detección de interrupciones**
- [x] **Estados visuales avanzados**
- [x] **Manejo robusto de WebSocket y eventos**

### **🔄 En progreso:**
- [ ] Migración a AudioWorklet (reemplazar ScriptProcessorNode)
- [ ] Optimización de latencia adicional
- [ ] Testing en dispositivos móviles


### **📋 Próximos pasos:**
1. **Características avanzadas:**
   - Indicador de volumen del micrófono
   - Configuración de voz de Eva (alloy, echo, fable)
   - Shortcuts de teclado (Space para push-to-talk)
   - Soporte multiidioma

2. **Integración de Email (nuevo workflow):**
   - [Ver workflow detallado aquí: Eva + Google Email Integration](#%20%F0%9F%93%A7%20Eva%20+%20Google%20Email%20Integration%20Workflow.md)
   - Login con Google y acceso a Gmail desde Eva
   - Redacción, envío y lectura de correos desde la interfaz unificada

3. **Optimización técnica:**
   - Reducir latencia de WebSocket
   - Compresión de audio más eficiente
   - Reconexión automática inteligente

4. **Producción:**
   - Deploy con HTTPS (requerido para micrófono)
   - Load balancing para WebSocket connections
   - Monitoreo de performance y analytics

---

## 🎯 **Comparación: Antes vs Ahora**

| Aspecto | **Antes (Separado)** | **Ahora (UnifiedChat)** |
|---|---|---|
| **Interfaz** | Chat texto + EvaLiveVoice separados | Una sola interfaz unificada |
| **Archivos** | ChatMain.js + EvaLiveVoice.js | UnifiedChat.js (todo en uno) |
| **Flujo de mensajes** | Sistemas separados con props complejos | Estado unificado con addMessage() |
| **Orden de mensajes** | Problemas de sincronización | Orden cronológico perfecto |
| **Experiencia de usuario** | Confuso cambiar entre modos | Fluido cambio texto ↔ voz |
| **Mantenimiento** | Código duplicado, props complejos | Una sola fuente de verdad |
| **Estados** | Dispersos entre componentes | Centralizados y coherentes |

**🚀 Resultado: Interfaz mucho más limpia, mantenible y funcional!**
