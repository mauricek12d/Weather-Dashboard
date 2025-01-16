import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const API_KEY = process.env.WEATHER_API_KEY || '';
const GEO_URL = 'http://api.openweathermap.org/geo/1.0/direct';
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// Define an interface for the Coordinates object
interface Coordinates {
  latitude: number;
  longitude: number;
}

// Define a class for the Weather object
class Weather {
  cityName: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;

  constructor(
    cityName: string,
    temperature: number,
    description: string,
    humidity: number,
    windSpeed: number
  ) {
    this.cityName = cityName;
    this.temperature = temperature;
    this.description = description;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
  }
}

class WeatherService {
  private baseURL: string = 'https://api.openweathermap.org/data/2.5';
  private geoURL: string = 'http://api.openweathermap.org/geo/1.0';
  private apiKey: string = process.env.WEATHER_API_KEY || '';
  private cityName: string = '';

  // Fetch location data (latitude and longitude) for a city
  private async fetchLocationData(query: string): Promise<any> {
    const url = `${this.geoURL}/direct?q=${query}&limit=1&appid=${this.apiKey}`;
    const response = await axios.get(url);
    return response.data;
  }

  // Destructure location data to extract coordinates
  private destructureLocationData(locationData: any): Coordinates {
    return {
      latitude: locationData[0].lat,
      longitude: locationData[0].lon,
    };
  }

  // Build a query string for the weather API
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.apiKey}&units=metric`;
  }

  // Fetch and destructure location data
  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(this.cityName);
    return this.destructureLocationData(locationData);
  }

  // Fetch weather data based on coordinates
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const url = this.buildWeatherQuery(coordinates);
    const response = await axios.get(url);
    return response.data;
  }

  // Parse the current weather data into the Weather object
  private parseCurrentWeather(response: any): Weather {
    return new Weather(
      response.name,
      response.main.temp,
      response.weather[0].description,
      response.main.humidity,
      response.wind.speed
    );
  }

  // Fetch and parse weather data for a given city
  async getWeatherForCity(city: string): Promise<Weather> {
    this.cityName = city;

    if (!this.apiKey) {
      throw new Error('API key is missing.');
    }

    try {
      const coordinates = await this.fetchAndDestructureLocationData();
      const weatherData = await this.fetchWeatherData(coordinates);
      return this.parseCurrentWeather(weatherData);
    } catch (error) {
      throw new Error('Failed to fetch weather data.');
    }
  }

}

export async function getCoordinates(city: string): Promise<{ lat: number; lon: number }> {
  const response = await axios.get(GEO_URL, {
    params: { q: city, limit: 1, appid: API_KEY },
  });

  if (!response.data.length) {
    throw new Error('City not found.');
  }

  return { lat: response.data[0].lat, lon: response.data[0].lon };
}

export async function getFiveDayForecast(lat: number, lon: number): Promise<any> {
  const response = await axios.get(WEATHER_URL, {
    params: { lat, lon, appid: API_KEY, units: 'metric' },
  });

  return response.data;
}

export default new WeatherService();
