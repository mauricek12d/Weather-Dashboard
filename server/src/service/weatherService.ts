import dotenv from 'dotenv';
import axios, { AxiosResponse } from 'axios';

dotenv.config();

const API_KEY = process.env.WEATHER_API_KEY;

if (!API_KEY) {
  throw new Error('API key is missing. Please set the WEATHER_API_KEY environment variable.');
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationData {
  name: string;
  lat: number;
  lon: number;
  country: string;
}

interface WeatherData {
  city: {
    name: string;
  };
  list: Array<{
    main: {
      temp: number;
      humidity: number;
    };
    weather: Array<{
      icon: string;
      description: string;
    }>;
    wind: {
      speed: number;
    };
    dt_txt: string;
  }>;
}

export class Weather {
  constructor(
    public cityName: string,
    public temperature: number,
    public icon: string,
    public description: string,
    public humidity: number,
    public windSpeed: number,
    public dateTime: string
  ) {}
}

class WeatherService {
  private baseURL: string = 'https://api.openweathermap.org/data/2.5';
  private geoURL: string = 'http://api.openweathermap.org/geo/1.0';
  private apiKey: string = API_KEY!;

  /**
   * ✅ Celsius to Fahrenheit conversion method
   */
  private celsiusToFahrenheit(tempC: number): number {
    return (tempC * 9) / 5 + 32;
  }

  /**
   * Fetches geographical coordinates for a given city.
   */
  private async fetchLocationData(city: string): Promise<LocationData> {
    if (!city || typeof city !== 'string' || city.trim() === '') {
      throw new Error('City name must be a non-empty string.');
    }

    const url = `${this.geoURL}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${this.apiKey}`;
    try {
      const response: AxiosResponse<LocationData[]> = await axios.get(url);
      if (response.data.length === 0) {
        throw new Error(`No location data found for city: ${city}`);
      }
      return response.data[0];
    } catch (error: any) {
      throw new Error(`Error fetching location data: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Fetches weather forecast data for given coordinates.
   */
  private async fetchWeatherData(coordinates: Coordinates): Promise<WeatherData> {
    const url = `${this.baseURL}/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.apiKey}&units=metric`;
    try {
      const response: AxiosResponse<WeatherData> = await axios.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(`Error fetching weather data: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Parses the current weather data.
   */
  private parseCurrentWeather(data: WeatherData): Weather {
    if (!data || !data.city || !data.list || data.list.length === 0) {
      throw new Error('Invalid weather data received.');
    }

    const currentData = data.list[0];

    return new Weather(
      data.city.name,
      Math.trunc(this.celsiusToFahrenheit(currentData.main.temp)), // Convert Celsius to Fahrenheit and gets rid of the decimal.
      currentData.weather[0]?.icon || '',
      currentData.weather[0]?.description || 'No Description',
      currentData.main.humidity,
      currentData.wind.speed,
      currentData.dt_txt || ''
    );
  }

  /**
   * Parses the five-day weather forecast data.
   */
  private parseFiveDayForecast(data: WeatherData): Weather[] {
    if (!data || !data.city || !data.list || data.list.length === 0) {
      throw new Error('Invalid weather data received.');
    }

    const forecast: Weather[] = [];
    const dailyForecasts = data.list.filter((entry) =>
      entry.dt_txt.includes('12:00:00')
  );

    for (const entry of dailyForecasts) {
      forecast.push(
        new Weather(
          data.city.name,
          Math.trunc(this.celsiusToFahrenheit(entry.main.temp)), 
          entry.weather[0]?.icon || '01d',
          entry.weather[0]?.description || 'No Description',
          entry.main.humidity || 0,
          entry.wind.speed || 0,
          entry.dt_txt || 'No Date'
        )
      );
    }

    console.log('Parsed 5-Day Forecast:', forecast)
    return forecast;
  }

  /**
   * Retrieves the current weather and five-day forecast for a city.
   */
  async getWeatherForCity(city: string): Promise<{ current: Weather; forecast: Weather[] }> {
    try {
      const locationData = await this.fetchLocationData(city);
      const coordinates: Coordinates = {
        latitude: locationData.lat,
        longitude: locationData.lon,
      };

      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = this.parseCurrentWeather(weatherData);
      const fiveDayForecast = this.parseFiveDayForecast(weatherData);

      return { current: currentWeather, forecast: fiveDayForecast };
    } catch (error: any) {
      console.error('Error in getWeatherForCity:', error.message);
      throw error;
    }
  }
}

export default new WeatherService();
