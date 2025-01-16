import { Router } from 'express';
import { getSearchHistory, addCityToHistory, deleteCityFromHistory } from '../../service/historyService';
import { getWeatherForCity } from '../../service/weatherService';
const router = Router();
// POST Request with city name to retrieve weather data
router.post('/weather', async (req, res) => {
    const { city } = req.body;
    if (!city || typeof city !== 'string' || city.trim() === '') {
        return res.status(400).json({ error: 'City name must be a non-empty string.' });
    }
    try {
        const forecast = await getWeatherForCity(city); // Fetch weather data
        await addCityToHistory(city); // Add city to search history
        return res.json(forecast); // Respond with forecast
    }
    catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'An unknown error occurred',
        });
    }
});
// GET Request to retrieve search history
router.get('/history', async (_, res) => {
    try {
        const searchHistory = await getSearchHistory();
        return res.json(searchHistory);
    }
    catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'An unknown error occurred',
        });
    }
});
// DELETE Request to remove a city from search history
router.delete('/history/:id', async (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'City ID must be provided and must be a string.' });
    }
    try {
        await deleteCityFromHistory(id); // Remove city from search history
        return res.json({ message: 'City deleted from history.' });
    }
    catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'An unknown error occurred',
        });
    }
});
export default router;
//# sourceMappingURL=weatherRoutes.js.map