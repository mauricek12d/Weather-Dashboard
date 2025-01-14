import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import weatherRoutes from './routes/api/weatherRoutes';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;

// Serve static files of the entire client dist folder
app.use(express.static(path.join(__dirname, '../public')));

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to connect the routes
app.use('/api', weatherRoutes);

// Default route to serve the main client application
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server on the port
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
