import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
//For env File 
dotenv.config();
const app = express();
const port = process.env.PORT || 8000;
app.use(cors());
app.get('/', (req, res) => {
    res.send('Welcome to Express & TypeScript Server in these backend page of vs app');
});
app.listen(port, () => {
    console.log(`Server is Fire at https://localhost:${port}`);
});
//# sourceMappingURL=index.js.map