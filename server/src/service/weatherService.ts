import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const API_KEY = process.env.WEATHER_API_KEY || '';

interface Coordinates {
  latitude: number;
  longitude: number;
}

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
  private apiKey: string = API_KEY;

  private async fetchLocationData(city: string): Promise<any> {
    if (!city || typeof city !== 'string' || city.trim() === '') {
      throw new Error('City name must be a non-empty string.');
    }

    const url = `${this.geoURL}/direct?q=${city}&limit=1&appid=${this.apiKey}`;
    try {
      const response = await axios.get(url);
      if (!response.data.length) {
        throw new Error('City not found.');
      }
      return response.data[0];
    } catch (error) {
      console.error('Error fetching location data:', error);
      throw new Error('Failed to fetch location data.');
    }
  }

  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const url = `${this.baseURL}/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.apiKey}&units=metric`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data.');
    }
  }

  private parseCurrentWeather(data: any): Weather {
    return new Weather(
      data.city.name,
      data.list[0].main.temp,
      data.list[0].weather[0].description,
      data.list[0].main.humidity,
      data.list[0].wind.speed
    );
  }

  private parseFiveDayForecast(data: any): Weather[] {
    const forecast: Weather[] = [];
    const dailyForecasts = data.list.filter((_: any, index: number) => index % 8 === 0); 
    for (const entry of dailyForecasts) {
      forecast.push(
        new Weather(
          data.city.name,
          entry.main.temp,
          entry.weather[0].description,
          entry.main.humidity,
          entry.wind.speed
        )
      );
    }
    return forecast;
  }

  async getWeatherForCity(city: string): Promise<{ current: Weather; forecast: Weather[] }> {
    if (!this.apiKey) {
      throw new Error('API key is missing.');
    }

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
    } catch (error) {
      console.error('Error in getWeatherForCity:', error);
      throw error;
    }
  }
}

export default new WeatherService();
