import { Router } from 'express';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

const { getSearchHistory, addCityToHistory, deleteCityFromHistory } = HistoryService;
const { getWeatherForCity } = WeatherService;

const router = Router();

// POST Request with city name to retrieve weather data
router.post('/weather', async (req, res) => {
  const { city } = req.body;

  if (!city || typeof city !== 'string' || city.trim() === '') {
    return res.status(400).json({ error: 'City name must be a non-empty string.' });
  }

  try {
    const forecast = await getWeatherForCity(city);
    await addCityToHistory(city);
    return res.json(forecast);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// GET search history
router.get('/history', async (_, res) => {
  try {
    const searchHistory = await getSearchHistory();
    res.json(searchHistory);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await deleteCityFromHistory(id);
    res.json({ message: 'City deleted from history.' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
