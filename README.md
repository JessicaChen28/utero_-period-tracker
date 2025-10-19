<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ll2I8L71ryx03wPOTATBR_U0F5DddHJu

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Microphone / Voice Assistant notes

Browsers only allow microphone access (getUserMedia) from secure contexts (HTTPS) or from `localhost`. If you run the Vite dev server with `--host` and access it via a LAN IP (for example `http://192.168.x.x:5173`), most browsers will consider that an insecure context and block microphone access. If the voice assistant doesn't work when you're serving the app on the network, try one of the following:

- Visit the app using `http://localhost:5173` instead of an IP address.
- Run Vite with HTTPS enabled (see Vite docs) or provide a local TLS certificate.
- Use a tunneling service that provides HTTPS (for example, ngrok) and open the tunnel URL in your browser.

The app will show a helpful error message when the microphone cannot be accessed.

## Running the local ElevenLabs TTS proxy (recommended)

To avoid exposing your ElevenLabs API key to the browser, run a small local proxy that forwards TTS requests.

1. Copy `.env.example` to `.env` and fill `ELEVENLABS_API_KEY`.
2. Start the proxy server:

```powershell
node server/index.js
```

By default the proxy listens on port 5178 and accepts requests from `http://localhost:5173` (the Vite dev server). The client can POST to `/api/tts` on the proxy with JSON { text, voice, format } and the proxy will return audio bytes.

Example client call (already supported by the UI patch I'll add next): POST http://localhost:5178/api/tts

