# 5-Day Weather Dashboard

A responsive web application that allows users to search for a city and view the current weather as well as a 5-day forecast. The project features a modern full-stack architecture with a **Vite**-powered frontend and an **Express** backend written in **TypeScript**.

## Features

- **City Search:** Enter a city name to retrieve its current weather conditions.
- **5-Day Forecast:** View a detailed weather forecast for the next 5 days.
- **Search History:** Automatically saves your recent city searches.
- **Responsive UI:** Optimized for desktop and mobile devices.
- **API Integration:** Fetches real-time weather data from a weather service (e.g., OpenWeatherMap).

## Live Demo

A live demo of the project is available at:  
[Weather Dashboard Demo](https://weather-dashboard-zso3.onrender.com)


## Technologies Used

- **Frontend:** Vite, TypeScript, HTML, CSS, Vanilla JavaScript, FontAwesome
- **Backend:** Node.js, Express, TypeScript, Axios
- **Build Tools:** Vite, TypeScript Compiler (`tsc`)

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14+ recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- Optional: [Git](https://git-scm.com/)

### Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/weather-dashboard.git
   cd weather-dashboard


**Configuration
Environment Variables
Create a .env file in the server directory and add the following:

PORT=3001
API_BASE_URL=https://api.openweathermap.org
WEATHER_API_KEY=your_weather_API_KEY 
Replace your_weather_api_key with your actual API key from your weather data provider (e.g., OpenWeatherMap).

npm run install
npm run build
npm run start


