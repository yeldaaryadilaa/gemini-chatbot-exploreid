import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = "gemini-2.5-flash-lite";

app.use(cors());
app.use(express.json());
app.use (express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;

    try {
        // apakah conversation adalah bukan array
        if (!Array.isArray(conversation)) throw new Error('Messages must be an array');

        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.9,
                systemInstruction: 'Anda adalah Travel Assistant profesional dari Explore.id. Tugas Anda adalah membantu pengguna merencanakan liburan dan memberikan rekomendasi wisata. JANGAN menjawab pertanyaan tentang perbankan atau keuangan. Fokus HANYA pada pariwisata, destinasi, dan paket tour. Jika pengguna bertanya rekomendasi paket, tawarkan: 1. Open Trip Bromo (Rp 350rb/pax), 2. Private Trip Bali 3H2M (Rp 2.5jt/pax), 3. Sailing Komodo 4H3M (Rp 3.5jt/pax). Jika ditanya topik lain di luar travel, tolak dengan sopan dan arahkan kembali ke liburan.'
            }
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.log(e.message);
        res.status(500).json({ error: e.message })
    }
});