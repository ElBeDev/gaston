const express = require('express');
const router = express.Router();
const WebSocket = require('ws');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const tmp = require('tmp');
ffmpeg.setFfmpegPath(ffmpegPath);

// Keep the existing POST endpoint for backward compatibility
router.post('/send-audio', async (req, res) => {
  const { audioBase64, history, contextInstructions } = req.body;
  const inputBuffer = Buffer.from(audioBase64, 'base64');
  const inputPath = path.join(__dirname, 'input.webm');
  const outputPath = path.join(__dirname, 'output.pcm');

  fs.writeFileSync(inputPath, inputBuffer);

  ffmpeg(inputPath)
    .audioChannels(1)
    .audioFrequency(24000)
    .audioCodec('pcm_s16le')
    .format('s16le')
    .save(outputPath)
    .on('end', () => {
      const pcmBuffer = fs.readFileSync(outputPath);
      const pcmBase64 = pcmBuffer.toString('base64');
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);

      let ws;

      try {
        const url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17";
        ws = new WebSocket(url, {
          headers: {
            "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
            "OpenAI-Beta": "realtime=v1"
          }
        });
      } catch (err) {
        return res.status(500).json({ error: 'No se pudo conectar a OpenAI Realtime API.' });
      }

      let audioChunks = [];
      let transcriptionText = '';
      let userTranscription = '';
      let isDone = false;

      ws.on('open', () => {
        console.log('🔌 Connected to OpenAI Realtime API');

        // Configure session with dynamic context
        const instructions = contextInstructions || 'Eres Eva, una asistente útil y simpática.';
        
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
            turn_detection: null,
            instructions: instructions,
            temperature: 0.8
          }
        }));

        // Add only the current audio input
        ws.send(JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [{
              type: 'input_audio',
              audio: pcmBase64
            }]
          }
        }));

        // Create response
        ws.send(JSON.stringify({
          type: 'response.create',
          response: {
            modalities: ['audio', 'text'],
            voice: 'alloy',
            output_audio_format: 'pcm16',
            temperature: 0.8
          }
        }));
      });

      ws.on('message', (data) => {
        const event = JSON.parse(data);
        console.log('📡 OpenAI Event:', event.type);

        if (event.type === 'session.updated') {
          console.log('✅ Session configured');
        }

        if (event.type === 'conversation.item.input_audio_transcription.completed') {
          userTranscription = event.transcript;
          console.log('👤 User said:', userTranscription);
        }

        if (event.type === 'response.audio.delta' && event.delta) {
          audioChunks.push(event.delta);
        }

        if (event.type === 'response.audio_transcript.delta' && event.delta) {
          transcriptionText += event.delta;
        }

        if (event.type === 'response.done' && !isDone) {
          isDone = true;
          console.log('🤖 Eva said:', transcriptionText);
          ws.close();

          const pcmBuffer = Buffer.from(audioChunks.join(''), 'base64');
          
          if (pcmBuffer.length === 0) {
            console.log('⚠️ No audio received from OpenAI');
            return res.json({
              audio: null,
              transcription: transcriptionText.trim() || "Lo siento, no pude generar una respuesta de audio.",
              userTranscription: userTranscription.trim() || "Audio recibido"
            });
          }

          const pcmFile = tmp.tmpNameSync({ postfix: '.pcm' });
          fs.writeFileSync(pcmFile, pcmBuffer);

          const wavFile = tmp.tmpNameSync({ postfix: '.wav' });
          spawnSync('ffmpeg', [
            '-f', 's16le',
            '-ar', '24000',
            '-ac', '1',
            '-i', pcmFile,
            wavFile
          ]);

          const wavBuffer = fs.readFileSync(wavFile);
          const wavBase64 = wavBuffer.toString('base64');

          fs.unlinkSync(pcmFile);
          fs.unlinkSync(wavFile);

          res.json({
            audio: wavBase64,
            transcription: transcriptionText.trim(),
            userTranscription: userTranscription.trim()
          });
        }

        if (event.type === 'error') {
          console.error('❌ OpenAI Error:', event);
          if (!isDone) {
            isDone = true;
            res.status(500).json({ error: event.error?.message || 'OpenAI API error' });
          }
        }
      });

      ws.on('error', (err) => {
        console.error('❌ WebSocket error:', err);
        if (!isDone) {
          isDone = true;
          res.status(500).json({ error: 'WebSocket error: ' + err.message });
        }
      });

      ws.on('close', () => {
        console.log('🔌 WebSocket connection closed');
        if (!isDone) {
          isDone = true;
          res.status(500).json({ error: 'Connection closed unexpectedly' });
        }
      });
    })
    .on('error', (err) => {
      console.error('❌ FFmpeg error:', err);
      res.status(500).json({ error: 'Audio processing error: ' + err.message });
    });
});

// WebSocket streaming endpoint - NEW APPROACH
let wss = null;

// Initialize WebSocket server when the module loads
const initializeWebSocketServer = (server) => {
  wss = new WebSocket.Server({ 
    port: 3003, // Use different port for WebSocket to avoid conflict
    path: '/stream'
  });
  
  wss.on('connection', (clientWs) => {
    console.log('🔌 Cliente conectado para streaming continuo');
    
    let openaiWs = null;
    
    clientWs.on('message', async (message) => {
      try {
        const event = JSON.parse(message);
        console.log('📡 Cliente envió:', event.type);
        
        if (event.type === 'session.update') {
          // Conectar a OpenAI Realtime API
          openaiWs = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17", {
            headers: {
              "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
              "OpenAI-Beta": "realtime=v1"
            }
          });
          
          openaiWs.on('open', () => {
            console.log('🔌 Conectado a OpenAI Realtime API para streaming');
            // Reenviar configuración de sesión
            openaiWs.send(JSON.stringify(event));
          });
          
          openaiWs.on('message', (data) => {
            try {
              const event = JSON.parse(data);
              console.log('📡 OpenAI sent:', event.type);
              
              // Log important events with details
              if (event.type === 'conversation.item.input_audio_transcription.completed') {
                console.log('👤 User transcript from OpenAI:', event.transcript);
              }
              if (event.type === 'response.audio_transcript.delta') {
                console.log('📝 Eva transcript delta from OpenAI:', event.delta);
              }
              if (event.type === 'response.audio_transcript.done') {
                console.log('📝 Eva transcript done from OpenAI:', event.transcript);
              }
              if (event.type === 'response.done') {
                console.log('🤖 OpenAI response done');
              }
              
            } catch (err) {
              console.log('📦 OpenAI sent binary data:', data.length, 'bytes');
            }
            
            // CRITICAL: Reenviar todos los eventos de OpenAI al cliente SIN FILTROS
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(data); // Send raw data, not JSON.stringify
              
              // Add debug to see what we're forwarding
              try {
                const event = JSON.parse(data);
                console.log('📤 Forwarded to frontend:', event.type);
              } catch (err) {
                console.log('📤 Forwarded binary data to frontend');
              }
            } else {
              console.log('⚠️ Cliente desconectado, no se puede reenviar evento');
            }
          });
          
          openaiWs.on('error', (error) => {
            console.error('❌ Error OpenAI WebSocket:', error);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({
                type: 'error',
                error: { message: 'Error de conexión con OpenAI' }
              }));
            }
          });
          
          openaiWs.on('close', () => {
            console.log('🔌 Conexión OpenAI cerrada');
          });
          
        } else if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
          // Reenviar otros eventos (audio, etc.) a OpenAI
          openaiWs.send(JSON.stringify(event));
        }
        
      } catch (err) {
        console.error('❌ Error procesando mensaje:', err);
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({
            type: 'error',
            error: { message: 'Error procesando mensaje' }
          }));
        }
      }
    });
    
    clientWs.on('close', () => {
      console.log('🔌 Cliente desconectado');
      if (openaiWs) {
        openaiWs.close();
      }
    });
    
    clientWs.on('error', (error) => {
      console.error('❌ Error cliente WebSocket:', error);
      if (openaiWs) {
        openaiWs.close();
      }
    });
  });
  
  console.log('🔌 WebSocket server iniciado en puerto 3003 para streaming continuo');
};

// Initialize WebSocket server immediately
initializeWebSocketServer();

// Regular HTTP endpoint to get WebSocket info
router.get('/stream', (req, res) => {
  res.json({ 
    message: 'WebSocket streaming available',
    endpoint: 'ws://localhost:3003/stream',
    status: wss ? 'running' : 'not initialized'
  });
});

module.exports = router;