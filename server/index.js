import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5178;

app.use(express.json({ limit: '1mb' }));

// Basic origin check - in a real app you should tighten this or add auth
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) return next();
  res.status(403).json({ error: 'Origin not allowed' });
});

app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'alloy', format = 'wav' } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing text' });

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server missing ElevenLabs API key' });

    // Example ElevenLabs API endpoint - adjust if ElevenLabs changes API path
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice}`;

    const elevenRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({ text }),
    });

    if (!elevenRes.ok) {
      const errText = await elevenRes.text();
      console.error('ElevenLabs error', elevenRes.status, errText);
      return res.status(502).send(errText);
    }

    // Return binary audio
    const arrayBuffer = await elevenRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.set('Content-Type', `audio/${format}`);
    res.send(buffer);
  } catch (err) {
    console.error('Proxy error', err);
    res.status(500).json({ error: String(err) });
  }
});

// Optional: serve static files when building a production bundle
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '..', 'dist')));

app.listen(PORT, () => {
  console.log(`TTS proxy listening on http://localhost:${PORT}`);
});
