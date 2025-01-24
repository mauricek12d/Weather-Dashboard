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
      description: string;
    }>;
    wind: {
      speed: number;
    };
    dt_txt: string;
  }>;
}

class Weather {
  constructor(
    public cityName: string,
    public temperature: number,
    public description: string,
    public humidity: number,
    public windSpeed: number,
    public dateTime?: string // Optional property for forecast entries
  ) {}
}

class WeatherService {
  private baseURL: string = 'https://api.openweathermap.org/data/2.5';
  private geoURL: string = 'http://api.openweathermap.org/geo/1.0';
  private apiKey: string = API_KEY!;

  /**
   * Fetches geographical coordinates (latitude and longitude) for a given city name.
   * @param city - The name of the city to fetch coordinates for.
   * @returns An object containing latitude and longitude.
   * @throws Will throw an error if the city name is invalid or if the API request fails.
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
      console.log(response.data)
      return response.data[0];
    } catch (error: any) {
      if (error.response) {
        // Server responded with a status other than 200 range
        throw new Error(`Error fetching location data: ${error.response.statusText}`);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response received from the location data service.');
      } else {
        // Something else caused the error
        throw new Error(`Error in fetchLocationData: ${error.message}`);
      }
    }
  }

  /**
   * Fetches weather forecast data for given geographical coordinates.
   * @param coordinates - An object containing latitude and longitude.
   * @returns The weather forecast data.
   * @throws Will throw an error if the API request fails.
   */
  private async fetchWeatherData(coordinates: Coordinates): Promise<WeatherData> {
    const url = `${this.baseURL}/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.apiKey}&units=metric`;
    try {
      const response: AxiosResponse<WeatherData> = await axios.get(url);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Error fetching weather data: ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('No response received from the weather data service.');
      } else {
        throw new Error(`Error in fetchWeatherData: ${error.message}`);
      }
    }
  }

  /**
   * Parses the current weather data from the fetched forecast data.
   * @param data - The weather forecast data.
   * @returns An instance of the Weather class representing the current weather.
   * @throws Will throw an error if the data structure is invalid.
   */
  private parseCurrentWeather(data: WeatherData): Weather {
    if (!data || !data.city || !data.list || data.list.length === 0) {
      throw new Error('Invalid weather data received.');
    }

    const currentData = data.list[0];
    return new Weather(
      data.city.name,
      currentData.main.temp,
      currentData.weather[0].description,
      currentData.main.humidity,
      currentData.wind.speed,
      currentData.dt_txt
    );
  }

  /**
   * Parses the five-day weather forecast data.
   * @param data - The weather forecast data.
   * @returns An array of Weather instances representing the daily forecasts.
   */
  private parseFiveDayForecast(data: WeatherData): Weather[] {
    if (!data || !data.city || !data.list || data.list.length === 0) {
      throw new Error('Invalid weather data received.');
    }

    const forecast: Weather[] = [];
    const dailyForecasts = data.list.filter((entry) =>
      entry.dt_txt.includes('12:00:00')
    ); // Select entries corresponding to midday for daily forecasts

    for (const entry of dailyForecasts) {
      forecast.push(
        new Weather(
          data.city.name,
          entry.main.temp,
          entry.weather[0].description,
          entry.main.humidity,
          entry.wind.speed,
          entry.dt_txt
        )
      );
    }
    return forecast;
  }

  /**
   * Retrieves the current weather and five-day forecast for a given city.
   * @param city - The name of the city to fetch weather data for.
   * @returns An object containing the current weather and an array of forecast data.
   * @throws Will throw an error if fetching or parsing data fails.
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
