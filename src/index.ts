import express, { Express } from 'express';
import dotenv from 'dotenv';
import matchRouter from './routes/match';
import playerRouter from './routes/player';
import tournamentRouter from './routes/tournament';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'ok',
		timestamp: new Date().toISOString(),
	});
});

app.use('/players', playerRouter);
app.use('/tournaments', tournamentRouter);
app.use('/matches', matchRouter);

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
