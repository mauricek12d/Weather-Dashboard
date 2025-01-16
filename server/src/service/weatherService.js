import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();
const API_KEY = process.env.WEATHER_API_KEY || '';
const GEO_URL = 'http://api.openweathermap.org/geo/1.0/direct';
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/forecast';
// Define a class for the Weather object
class Weather {
    constructor(cityName, temperature, description, humidity, windSpeed) {
        this.cityName = cityName;
        this.temperature = temperature;
        this.description = description;
        this.humidity = humidity;
        this.windSpeed = windSpeed;
    }
}
class WeatherService {
    constructor() {
        this.baseURL = 'https://api.openweathermap.org/data/2.5';
        this.geoURL = 'http://api.openweathermap.org/geo/1.0';
        this.apiKey = process.env.WEATHER_API_KEY || '';
        this.cityName = '';
    }
    // Fetch location data (latitude and longitude) for a city
    async fetchLocationData(query) {
        const url = `${this.geoURL}/direct?q=${query}&limit=1&appid=${this.apiKey}`;
        const response = await axios.get(url);
        return response.data;
    }
    // Destructure location data to extract coordinates
    destructureLocationData(locationData) {
        return {
            latitude: locationData[0].lat,
            longitude: locationData[0].lon,
        };
    }
    // Build a query string for the weather API
    buildWeatherQuery(coordinates) {
        return `${this.baseURL}/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.apiKey}&units=metric`;
    }
    // Fetch and destructure location data
    async fetchAndDestructureLocationData() {
        const locationData = await this.fetchLocationData(this.cityName);
        return this.destructureLocationData(locationData);
    }
    // Fetch weather data based on coordinates
    async fetchWeatherData(coordinates) {
        const url = this.buildWeatherQuery(coordinates);
        const response = await axios.get(url);
        return response.data;
    }
    // Parse the current weather data into the Weather object
    parseCurrentWeather(response) {
        return new Weather(response.name, response.main.temp, response.weather[0].description, response.main.humidity, response.wind.speed);
    }
    // Fetch and parse weather data for a given city
    async getWeatherForCity(city) {
        this.cityName = city;
        if (!this.apiKey) {
            throw new Error('API key is missing.');
        }
        try {
            const coordinates = await this.fetchAndDestructureLocationData();
            const weatherData = await this.fetchWeatherData(coordinates);
            return this.parseCurrentWeather(weatherData);
        }
        catch (error) {
            throw new Error('Failed to fetch weather data.');
        }
    }
}
export async function getCoordinates(city) {
    const response = await axios.get(GEO_URL, {
        params: { q: city, limit: 1, appid: API_KEY },
    });
    if (!response.data.length) {
        throw new Error('City not found.');
    }
    return { lat: response.data[0].lat, lon: response.data[0].lon };
}
export async function getFiveDayForecast(lat, lon) {
    const response = await axios.get(WEATHER_URL, {
        params: { lat, lon, appid: API_KEY, units: 'metric' },
    });
    return response.data;
}
export async function getWeatherForCity(city) {
    // Implementation for fetching weather data
    const API_KEY = process.env.WEATHER_API_KEY || '';
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    if (!response.ok) {
        throw new Error(`Failed to fetch weather for city: ${city}`);
    }
    const data = await response.json();
    return data;
}
export default new WeatherService();
//# sourceMappingURL=weatherService.js.map