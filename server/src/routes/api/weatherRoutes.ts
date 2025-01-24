import { Router } from 'express';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';


const router = Router();

// POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  const { cityName } = req.body;

  if (!cityName || typeof cityName !== 'string' || cityName.trim() === '') {
    return res.status(400).json({ error: 'City name must be a non-empty string.' });
  }

  try {
    const forecast = await WeatherService.getWeatherForCity(cityName);
    await HistoryService.addCityToHistory(cityName);
    return res.json(forecast);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// GET search history
router.get('/history', async (_, res) => {
  try {
    const searchHistory = await HistoryService.getSearchHistory();
    res.json(searchHistory);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await HistoryService.deleteCityFromHistory(id);
    res.json({ message: 'City deleted from history.' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

