// import express, { Express, Request, Response , Application } from 'express';
// import dotenv from 'dotenv';
// import cors from "cors"
// //For env File 
// dotenv.config();
// const app: Application = express();
// const port = process.env.PORT || 8000;
// app.use(cors());

// app.get('/', (req: Request, res: Response) => {
//   res.send('Welcome to Express & TypeScript Server in these backend page of vs app');
// });

// app.listen(port, () => {
//   console.log(`Server is Fire at https://localhost:${port}`);
// });


import http from 'http'; // Importing the HTTP module
import app from './app.js'; // Importing the application logic

// Define the port
const PORT = process.env.PORT || 5000;

// Create the server
const server = http.createServer(app);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



