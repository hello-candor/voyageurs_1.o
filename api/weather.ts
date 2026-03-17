
import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENWEATHER_API_KEY = process.env.VITE_OPENWEATHER_API_KEY;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
    const fetchAPI = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await fetch(fetchAPI);

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
