// Define a City class with name and id properties
class City {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../db/searchHistory.json');

export async function getSearchHistory(): Promise<any[]> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function addCityToHistory(city: string): Promise<void> {
  const history = await getSearchHistory();
  history.push({ id: uuidv4(), city });
  await fs.writeFile(dbPath, JSON.stringify(history, null, 2));
}

export async function deleteCityFromHistory(id: string): Promise<void> {
  const history = await getSearchHistory();
  const updatedHistory = history.filter((entry) => entry.id !== id);
  await fs.writeFile(dbPath, JSON.stringify(updatedHistory, null, 2));
}

class HistoryService {
  // Reads the searchHistory.json file
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(dbPath, 'utf-8');
      return JSON.parse(data) as City[];
    } catch (error) {
      console.error('Error reading search history:', error);
      return [];
    }
  }

  // Writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    try {
      await fs.writeFile(dbPath, JSON.stringify(cities, null, 2));
    } catch (error) {
      console.error('Error writing search history:', error);
    }
  }

  // Reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getSearchHistory(): Promise<City[]> {
    return this.read();
  }

  // Adds a city to the searchHistory.json file
  async addCityToHistory(name: string): Promise<void> {
    const cities = await this.read();
    const newCity = new City(uuidv4(), name);
    cities.push(newCity);
    await this.write(cities);
  }

  // Removes a city from the searchHistory.json file
  async deleteCityFromHistory(id: string): Promise<void> {
    const cities = await this.read();
    const updatedCities = cities.filter((city) => city.id !== id);
    await this.write(updatedCities);
  }
}

export default new HistoryService();
