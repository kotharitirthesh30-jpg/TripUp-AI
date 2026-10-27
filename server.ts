import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  generateGeminiItinerary,
  queryGoogleMapsGrounding,
  queryGoogleSearchGrounding
} from './src/server/gemini-api';
import { generateSmartItinerary } from './src/lib/ai/itinerary-generator';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'TripUp AI API Server',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      time: new Date().toISOString(),
    });
  });

  // Google Maps Grounding Endpoint
  app.post('/api/ai/maps-grounding', async (req: Request, res: Response) => {
    try {
      const { destination, latitude, longitude } = req.body;
      if (!destination) {
        return res.status(400).json({ error: 'Missing destination parameter' });
      }
      const data = await queryGoogleMapsGrounding(destination, latitude, longitude);
      return res.json(data);
    } catch (err: any) {
      console.error('Maps grounding route error:', err);
      return res.status(500).json({ error: err.message || 'Maps grounding error' });
    }
  });

  // Google Search Grounding Endpoint
  app.post('/api/ai/search-grounding', async (req: Request, res: Response) => {
    try {
      const { destination, query } = req.body;
      if (!destination) {
        return res.status(400).json({ error: 'Missing destination parameter' });
      }
      const data = await queryGoogleSearchGrounding(destination, query);
      return res.json(data);
    } catch (err: any) {
      console.error('Search grounding route error:', err);
      return res.status(500).json({ error: err.message || 'Search grounding error' });
    }
  });

  // AI Itinerary Generation
  app.post('/api/ai/generate', async (req: Request, res: Response) => {
    try {
      const input = req.body;
      if (!input || !input.destination || !input.startDate || !input.endDate) {
        return res.status(400).json({ error: 'Missing required trip parameters (destination, startDate, endDate).' });
      }

      const itineraryResult = await generateGeminiItinerary({
        origin: input.origin || 'San Francisco, CA',
        destination: input.destination,
        startDate: input.startDate,
        endDate: input.endDate,
        travelers: Number(input.travelers) || 2,
        budgetAmount: typeof input.budgetAmount === 'number' ? input.budgetAmount : (Number(input.budgetAmount) || 0),
        currency: input.currency || 'INR',
        interests: input.interests || ['culture', 'food', 'nature'],
        travelStyle: input.travelStyle || 'balanced',
        transportPreferences: input.transportPreferences || ['private_car', 'walking'],
        accommodationPreferences: input.accommodationPreferences || 'boutique hotel',
        dietaryPreference: input.dietaryPreference || 'veg_nonveg',
        customPrompt: input.customPrompt || '',
      });

      return res.json(itineraryResult);
    } catch (err: any) {
      console.error('Error generating itinerary in server handler:', err);
      const input = req.body || {};
      const fallbackResult = generateSmartItinerary({
        origin: input.origin || 'Source',
        destination: input.destination || 'Destination',
        startDate: input.startDate || new Date().toISOString().split('T')[0],
        endDate: input.endDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        travelers: Number(input.travelers) || 2,
        budgetAmount: typeof input.budgetAmount === 'number' ? input.budgetAmount : (Number(input.budgetAmount) || 0),
        currency: input.currency || 'INR',
        interests: input.interests || ['culture', 'food', 'nature'],
        travelStyle: input.travelStyle || 'balanced',
        transportPreferences: input.transportPreferences || ['private_car', 'walking'],
        accommodationPreferences: input.accommodationPreferences || 'boutique hotel',
        dietaryPreference: input.dietaryPreference || 'veg_nonveg',
        customPrompt: input.customPrompt || '',
      });
      return res.json({
        ...fallbackResult,
        source: 'smart-engine',
      });
    }
  });

  // AI Suggestions & Budget optimization
  app.post('/api/ai/suggestions', (req: Request, res: Response) => {
    const { currentBudget, totalExpenses, destination } = req.body;
    const diff = (totalExpenses || 0) - (currentBudget || 0);

    const tips = [
      `Opt for regional multi-day rail passes in ${destination || 'your destination'} rather than point-to-point tickets.`,
      `Book Michelin lunch menus instead of dinner for identical cuisine at 40-50% lower price.`,
      `Consider traditional heritage guesthouses or central boutique apartments with kitchenettes for morning coffee.`,
      `Reserve temple and museum timed-entry tickets in advance to skip premium express lane surcharges.`,
    ];

    res.json({
      tips,
      isOverBudget: diff > 0,
      potentialSavings: diff > 0 ? Math.round(diff * 0.75) : 150,
    });
  });

  // Weather Intelligence API for any worldwide destination
  app.get('/api/weather', (req: Request, res: Response) => {
    const destination = (req.query.destination as string) || 'Kyoto';
    const destLower = destination.toLowerCase();

    let temp = 20;
    let condition = 'Partly Cloudy';
    let humidity = 55;
    let windKmh = 12;
    let rainProb = 15;

    if (destLower.includes('alps') || destLower.includes('zermatt') || destLower.includes('iceland') || destLower.includes('reykjavik') || destLower.includes('banff') || destLower.includes('patagonia')) {
      temp = 9;
      condition = 'Crisp Alpine & Glacial Air';
      humidity = 42;
      windKmh = 19;
      rainProb = 15;
    } else if (destLower.includes('bali') || destLower.includes('bangkok') || destLower.includes('singapore') || destLower.includes('bora bora') || destLower.includes('hawaii') || destLower.includes('maui') || destLower.includes('fiji') || destLower.includes('caribbean')) {
      temp = 29;
      condition = 'Warm Tropical Sunshine';
      humidity = 76;
      windKmh = 14;
      rainProb = 25;
    } else if (destLower.includes('cairo') || destLower.includes('egypt') || destLower.includes('dubai') || destLower.includes('petra') || destLower.includes('jordan') || destLower.includes('marrakech') || destLower.includes('grand canyon')) {
      temp = 28;
      condition = 'Dry Desert Sunshine';
      humidity = 28;
      windKmh = 15;
      rainProb = 0;
    } else if (destLower.includes('paris') || destLower.includes('london') || destLower.includes('amsterdam') || destLower.includes('seoul') || destLower.includes('new york') || destLower.includes('vancouver')) {
      temp = 17;
      condition = 'Mild & Clear City Skies';
      humidity = 58;
      windKmh = 11;
      rainProb = 20;
    } else if (destLower.includes('amalfi') || destLower.includes('rome') || destLower.includes('barcelona') || destLower.includes('santorini') || destLower.includes('greece') || destLower.includes('sydney') || destLower.includes('cape town')) {
      temp = 23;
      condition = 'Sun-drenched Coastal Breeze';
      humidity = 54;
      windKmh = 14;
      rainProb = 8;
    } else {
      // General worldwide algorithm based on name hash
      const hash = destination.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      temp = 16 + (hash % 14); // 16C to 30C
      humidity = 40 + (hash % 40);
      rainProb = hash % 35;
      condition = rainProb > 25 ? 'Scattered Clouds & Showers' : 'Mild Sun & Gentle Breeze';
    }

    res.json({
      destination,
      temperatureC: temp,
      temperatureF: Math.round((temp * 9) / 5 + 32),
      condition,
      humidity,
      windKmh,
      rainProb,
      forecast: [
        { day: 'Day 1', tempC: temp, condition, rainProb },
        { day: 'Day 2', tempC: temp + 1, condition: 'Sunny', rainProb: Math.max(0, rainProb - 5) },
        { day: 'Day 3', tempC: temp - 1, condition: 'Passing Clouds', rainProb: rainProb + 10 },
        { day: 'Day 4', tempC: temp + 2, condition: 'Clear Sky', rainProb: Math.max(0, rainProb - 8) },
      ],
      recommendation: rainProb > 30
        ? 'Pack light waterproof layers; schedule indoor museums during afternoon rain showers.'
        : 'Ideal clear conditions for outdoor explorations, architectural walks, and photography.',
    });
  });

  // Places Autocomplete / Worldwide Search endpoint
  app.get('/api/places/search', (req: Request, res: Response) => {
    const rawQuery = (req.query.q as string || '').trim();
    const query = rawQuery.toLowerCase();

    const WORLDWIDE_PLACES = [
      // Asia
      { name: 'Kyoto, Japan', country: 'Japan', continent: 'Asia', lat: 35.0116, lng: 135.7681, type: 'heritage' },
      { name: 'Tokyo, Japan', country: 'Japan', continent: 'Asia', lat: 35.6762, lng: 139.6503, type: 'city' },
      { name: 'Osaka, Japan', country: 'Japan', continent: 'Asia', lat: 34.6937, lng: 135.5023, type: 'food' },
      { name: 'Bangkok, Thailand', country: 'Thailand', continent: 'Asia', lat: 13.7563, lng: 100.5018, type: 'city' },
      { name: 'Chiang Mai, Thailand', country: 'Thailand', continent: 'Asia', lat: 18.7883, lng: 98.9853, type: 'culture' },
      { name: 'Bali (Ubud & Uluwatu), Indonesia', country: 'Indonesia', continent: 'Asia', lat: -8.4095, lng: 115.1889, type: 'island' },
      { name: 'Singapore', country: 'Singapore', continent: 'Asia', lat: 1.3521, lng: 103.8198, type: 'city' },
      { name: 'Seoul, South Korea', country: 'South Korea', continent: 'Asia', lat: 37.5665, lng: 126.978, type: 'city' },
      { name: 'Jeju Island, South Korea', country: 'South Korea', continent: 'Asia', lat: 33.4996, lng: 126.5312, type: 'nature' },
      { name: 'Tithal Beach (Valsad), Gujarat, India', country: 'India', continent: 'Asia', lat: 20.6094, lng: 72.8983, type: 'coastal' },
      { name: 'Nashik Road & Nashik, Maharashtra, India', country: 'India', continent: 'Asia', lat: 19.9975, lng: 73.7898, type: 'heritage' },
      { name: 'Saputara Hill Station, Gujarat, India', country: 'India', continent: 'Asia', lat: 20.5794, lng: 73.7483, type: 'mountain' },
      { name: 'Jaipur & Agra (Taj Mahal), India', country: 'India', continent: 'Asia', lat: 27.1751, lng: 78.0421, type: 'heritage' },
      { name: 'Goa Beaches & Old Goa, India', country: 'India', continent: 'Asia', lat: 15.2993, lng: 74.124, type: 'coastal' },
      { name: 'Mumbai, Maharashtra, India', country: 'India', continent: 'Asia', lat: 19.076, lng: 72.8777, type: 'city' },
      { name: 'Udaipur & Lake Pichola, Rajasthan, India', country: 'India', continent: 'Asia', lat: 24.5854, lng: 73.7125, type: 'heritage' },
      { name: 'Varanasi, India', country: 'India', continent: 'Asia', lat: 25.3176, lng: 82.9739, type: 'culture' },
      { name: 'Hanoi & Ha Long Bay, Vietnam', country: 'Vietnam', continent: 'Asia', lat: 21.0285, lng: 105.8542, type: 'nature' },
      { name: 'Da Nang & Hoi An, Vietnam', country: 'Vietnam', continent: 'Asia', lat: 15.8801, lng: 108.338, type: 'heritage' },
      { name: 'Kathmandu & Himalayas, Nepal', country: 'Nepal', continent: 'Asia', lat: 27.7172, lng: 85.324, type: 'mountain' },
      { name: 'Taipei, Taiwan', country: 'Taiwan', continent: 'Asia', lat: 25.033, lng: 121.5654, type: 'city' },
      { name: 'Siem Reap & Angkor Wat, Cambodia', country: 'Cambodia', continent: 'Asia', lat: 13.3671, lng: 103.8448, type: 'heritage' },

      // Europe
      { name: 'Paris, France', country: 'France', continent: 'Europe', lat: 48.8566, lng: 2.3522, type: 'city' },
      { name: 'Nice & French Riviera, France', country: 'France', continent: 'Europe', lat: 43.7102, lng: 7.262, type: 'coastal' },
      { name: 'Rome, Italy', country: 'Italy', continent: 'Europe', lat: 41.9028, lng: 12.4964, type: 'heritage' },
      { name: 'Amalfi Coast & Positano, Italy', country: 'Italy', continent: 'Europe', lat: 40.634, lng: 14.6027, type: 'coastal' },
      { name: 'Florence & Tuscany, Italy', country: 'Italy', continent: 'Europe', lat: 43.7696, lng: 11.2558, type: 'art' },
      { name: 'Venice, Italy', country: 'Italy', continent: 'Europe', lat: 45.4408, lng: 12.3155, type: 'heritage' },
      { name: 'Swiss Alps (Zermatt & Matterhorn), Switzerland', country: 'Switzerland', continent: 'Europe', lat: 45.9765, lng: 7.7491, type: 'mountain' },
      { name: 'Interlaken & Jungfrau, Switzerland', country: 'Switzerland', continent: 'Europe', lat: 46.6863, lng: 7.8632, type: 'mountain' },
      { name: 'London, United Kingdom', country: 'United Kingdom', continent: 'Europe', lat: 51.5074, lng: -0.1278, type: 'city' },
      { name: 'Edinburgh & Scottish Highlands, UK', country: 'United Kingdom', continent: 'Europe', lat: 55.9533, lng: -3.1883, type: 'heritage' },
      { name: 'Barcelona, Spain', country: 'Spain', continent: 'Europe', lat: 41.3879, lng: 2.1699, type: 'architecture' },
      { name: 'Madrid, Spain', country: 'Spain', continent: 'Europe', lat: 40.4168, lng: -3.7038, type: 'art' },
      { name: 'Santorini & Cyclades, Greece', country: 'Greece', continent: 'Europe', lat: 36.3932, lng: 25.4615, type: 'island' },
      { name: 'Athens, Greece', country: 'Greece', continent: 'Europe', lat: 37.9838, lng: 23.7275, type: 'heritage' },
      { name: 'Amsterdam, Netherlands', country: 'Netherlands', continent: 'Europe', lat: 52.3676, lng: 4.9041, type: 'culture' },
      { name: 'Reykjavik & Golden Circle, Iceland', country: 'Iceland', continent: 'Europe', lat: 64.1466, lng: -21.9426, type: 'nature' },
      { name: 'Prague, Czech Republic', country: 'Czech Republic', continent: 'Europe', lat: 50.0755, lng: 14.4378, type: 'heritage' },
      { name: 'Vienna, Austria', country: 'Austria', continent: 'Europe', lat: 48.2082, lng: 16.3738, type: 'music' },
      { name: 'Dubrovnik & Adriatic Coast, Croatia', country: 'Croatia', continent: 'Europe', lat: 42.6507, lng: 18.0944, type: 'coastal' },
      { name: 'Lisbon & Sintra, Portugal', country: 'Portugal', continent: 'Europe', lat: 38.7223, lng: -9.1393, type: 'coastal' },
      { name: 'Tromsø & Norwegian Fjords, Norway', country: 'Norway', continent: 'Europe', lat: 69.6492, lng: 18.9553, type: 'nature' },

      // North America
      { name: 'New York City, USA', country: 'United States', continent: 'North America', lat: 40.7128, lng: -74.006, type: 'city' },
      { name: 'San Francisco & California Coast, USA', country: 'United States', continent: 'North America', lat: 37.7749, lng: -122.4194, type: 'city' },
      { name: 'Grand Canyon & Sedona, USA', country: 'United States', continent: 'North America', lat: 36.0544, lng: -112.1401, type: 'nature' },
      { name: 'Maui & Oahu (Hawaii), USA', country: 'United States', continent: 'North America', lat: 20.7984, lng: -156.3319, type: 'island' },
      { name: 'Banff & Lake Louise, Canada', country: 'Canada', continent: 'North America', lat: 51.1784, lng: -115.5708, type: 'mountain' },
      { name: 'Vancouver & Whistler, Canada', country: 'Canada', continent: 'North America', lat: 49.2827, lng: -123.1207, type: 'nature' },
      { name: 'Mexico City & Oaxaca, Mexico', country: 'Mexico', continent: 'North America', lat: 19.4326, lng: -99.1332, type: 'culture' },
      { name: 'Cancún & Riviera Maya, Mexico', country: 'Mexico', continent: 'North America', lat: 21.1619, lng: -86.8515, type: 'coastal' },

      // South America
      { name: 'Machu Picchu & Cusco, Peru', country: 'Peru', continent: 'South America', lat: -13.1631, lng: -72.545, type: 'heritage' },
      { name: 'Rio de Janeiro, Brazil', country: 'Brazil', continent: 'South America', lat: -22.9068, lng: -43.1729, type: 'coastal' },
      { name: 'Buenos Aires, Argentina', country: 'Argentina', continent: 'South America', lat: -34.6037, lng: -58.3816, type: 'culture' },
      { name: 'Patagonia & Torres del Paine, Chile', country: 'Chile', continent: 'South America', lat: -51.2532, lng: -72.8814, type: 'nature' },
      { name: 'Galápagos Islands, Ecuador', country: 'Ecuador', continent: 'South America', lat: -0.9538, lng: -90.9656, type: 'nature' },
      { name: 'Cartagena & Rosario Islands, Colombia', country: 'Colombia', continent: 'South America', lat: 10.391, lng: -75.4794, type: 'heritage' },
      { name: 'Salar de Uyuni Salt Flats, Bolivia', country: 'Bolivia', continent: 'South America', lat: -20.1338, lng: -67.4891, type: 'nature' },

      // Africa
      { name: 'Cairo & Giza (Pyramids), Egypt', country: 'Egypt', continent: 'Africa', lat: 29.9792, lng: 31.1342, type: 'heritage' },
      { name: 'Serengeti & Zanzibar, Tanzania', country: 'Tanzania', continent: 'Africa', lat: -2.3333, lng: 34.8333, type: 'nature' },
      { name: 'Cape Town & Garden Route, South Africa', country: 'South Africa', continent: 'Africa', lat: -33.9249, lng: 18.4241, type: 'nature' },
      { name: 'Marrakech & Atlas Mountains, Morocco', country: 'Morocco', continent: 'Africa', lat: 31.6295, lng: -7.9811, type: 'culture' },
      { name: 'Victoria Falls, Zimbabwe & Zambia', country: 'Zimbabwe', continent: 'Africa', lat: -17.9243, lng: 25.8572, type: 'nature' },
      { name: 'Masai Mara Safari, Kenya', country: 'Kenya', continent: 'Africa', lat: -1.4061, lng: 35.0062, type: 'nature' },

      // Oceania
      { name: 'Sydney & Blue Mountains, Australia', country: 'Australia', continent: 'Oceania', lat: -33.8688, lng: 151.2093, type: 'city' },
      { name: 'Melbourne & Great Ocean Road, Australia', country: 'Australia', continent: 'Oceania', lat: -37.8136, lng: 144.9631, type: 'coastal' },
      { name: 'Great Barrier Reef & Cairns, Australia', country: 'Australia', continent: 'Oceania', lat: -16.9186, lng: 145.7781, type: 'nature' },
      { name: 'Queenstown & Milford Sound, New Zealand', country: 'New Zealand', continent: 'Oceania', lat: -45.0312, lng: 168.6626, type: 'adventure' },
      { name: 'Auckland & Bay of Islands, New Zealand', country: 'New Zealand', continent: 'Oceania', lat: -36.8485, lng: 174.7633, type: 'nature' },
      { name: 'Bora Bora & Tahiti, French Polynesia', country: 'French Polynesia', continent: 'Oceania', lat: -16.5004, lng: -151.7415, type: 'island' },
      { name: 'Fiji Coral Coast & Mamanucas', country: 'Fiji', continent: 'Oceania', lat: -17.7134, lng: 178.065, type: 'island' },

      // Middle East
      { name: 'Dubai & Abu Dhabi, UAE', country: 'United Arab Emirates', continent: 'Middle East', lat: 25.2048, lng: 55.2708, type: 'city' },
      { name: 'Petra & Wadi Rum, Jordan', country: 'Jordan', continent: 'Middle East', lat: 30.3285, lng: 35.4444, type: 'heritage' },
      { name: 'Istanbul & Cappadocia, Turkey', country: 'Turkey', continent: 'Middle East', lat: 41.0082, lng: 28.9784, type: 'heritage' },
      { name: 'Muscat & Wahiba Sands, Oman', country: 'Oman', continent: 'Middle East', lat: 23.588, lng: 58.3829, type: 'culture' },
    ];

    let results = WORLDWIDE_PLACES.filter(s =>
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.country.toLowerCase().includes(query) ||
      s.continent.toLowerCase().includes(query)
    );

    // If query was typed and no exact matches found, provide the custom query as a world travel destination
    if (query && results.length === 0) {
      const formatted = rawQuery.charAt(0).toUpperCase() + rawQuery.slice(1);
      results = [
        {
          name: formatted,
          country: 'Worldwide Destination',
          continent: 'Global',
          lat: 0,
          lng: 0,
          type: 'custom'
        }
      ];
    }

    res.json(results);
  });

  // Serve static files or Vite middlewares
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TripUp AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start TripUp AI server:', err);
  process.exit(1);
});
