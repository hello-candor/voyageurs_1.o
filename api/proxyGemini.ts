
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // Handle CORS preflight if necessary (though usually handled by the platform)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // @google/genai-sdk: The API key must be obtained exclusively from process.env.API_KEY.
    if (!process.env.API_KEY) {
      console.error("Server Error: process.env.API_KEY is missing.");
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const { model, contents, config } = req.body;

    // @google/genai-sdk: Initialize with the mandatory API_KEY.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Proxy the request to Gemini
    const response = await ai.models.generateContent({
      model,
      contents,
      config
    });

    // Return the full response object
    return res.status(200).json(response);

  } catch (error: any) {
    console.error("Gemini Proxy Error:", error);
    return res.status(500).json({ 
      error: error.message || 'Internal Server Error',
      details: error.toString()
    });
  }
}
