
import { NextApiRequest, NextApiResponse } from 'next';
import { Airports } from 'airport-db';

// Initialize the airport database
const adb = new Airports();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query, lat, lon } = req.query;

  try {
    if (query && typeof query === 'string') {
      // --- Search by Query ---
      adb.search({ q: query, limit: 10 });
      const results = adb.get();
      
      res.status(200).json({
        message: 'Success',
        data: results.map((r: any) => ({
          iata_code: r.iata_code,
          airport_name: r.airport_name,
          city_name: r.city_name,
          country_name: r.country_name,
        })),
      });

    } else if (lat && lon && typeof lat === 'string' && typeof lon === 'string') {
      // --- Search by Geolocation ---
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: 'Invalid latitude or longitude' });
      }

      adb.nearby({ latitude, longitude, limit: 1 });
      const results = adb.get();
      
      if (results && results.length > 0) {
        const nearest = results[0];
        res.status(200).json({
          message: 'Success',
          data: {
            iata_code: nearest.iata_code,
            airport_name: nearest.airport_name,
            city_name: nearest.city_name,
            country_name: nearest.country_name,
          },
        });
      } else {
        res.status(404).json({ message: 'No nearby airports found' });
      }

    } else {
      res.status(400).json({ message: 'Missing query or lat/lon parameters' });
    }
  } catch (error) {
    console.error('Error in places API:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
